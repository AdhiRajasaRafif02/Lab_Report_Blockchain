import fs from "node:fs/promises";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { sha256Hex } from "../../utils/crypto.js";
import { auditService } from "../audit/audit.service.js";
import { blockchainService } from "../blockchain/blockchain.service.js";

type VerificationStatus = "AUTHENTIC" | "REVOKED" | "MISMATCH" | "NOT_FOUND";
type VerificationDocument = {
  id: string;
  documentCode: string;
  fileName: string;
  documentType: string;
  status: "active" | "revoked";
  txHash: string | null;
  uploadedAt: Date;
  fileHash: string;
};

const statusToDbResult = (status: VerificationStatus): "authentic" | "revoked" | "tampered" | "not_found" => {
  if (status === "AUTHENTIC") return "authentic";
  if (status === "REVOKED") return "revoked";
  if (status === "MISMATCH") return "tampered";
  return "not_found";
};

const messageByStatus: Record<VerificationStatus, string> = {
  AUTHENTIC: "Hash matches a registered active document.",
  REVOKED: "Hash matches a registered document, but the document is revoked.",
  MISMATCH: "Provided document ID does not match uploaded file hash.",
  NOT_FOUND: "No registered hash matches this uploaded file."
};

export const verificationService = {
  verifyUploadedFile: async (input: {
    file: Express.Multer.File | undefined;
    verifierUserId: string;
    documentId?: string;
  }) => {
    if (!input.file) {
      throw new AppError("File is required", 400, "FILE_REQUIRED");
    }
    if (input.file.mimetype !== "application/pdf") {
      throw new AppError("Only PDF files are allowed", 400, "INVALID_FILE_TYPE");
    }
    if (input.file.size <= 0) {
      throw new AppError("Uploaded file is empty", 400, "EMPTY_FILE");
    }

    let computedHash = "";
    try {
      const fileBuffer = await fs.readFile(input.file.path);
      computedHash = sha256Hex(fileBuffer);

      const verifyChain = await blockchainService.verifyDocumentHash(computedHash);
      const onChainByHash = verifyChain.exists
        ? await blockchainService.getDocumentByHash(computedHash)
        : null;
      if (verifyChain.exists && !onChainByHash) {
        throw new AppError(
          "Inconsistent blockchain state: hash exists but record lookup failed",
          409,
          "BLOCKCHAIN_INCONSISTENT_STATE"
        );
      }

      const matchedDocument: VerificationDocument | null = verifyChain.exists
        ? await prisma.document.findFirst({
            where: { id: verifyChain.documentId },
            select: {
              id: true,
              documentCode: true,
              fileName: true,
              documentType: true,
              status: true,
              txHash: true,
              uploadedAt: true,
              fileHash: true
            }
          })
        : null;

      let verificationStatus: VerificationStatus = "NOT_FOUND";
      let expectedDocument: VerificationDocument | null = null;

      if (input.documentId) {
        expectedDocument = await prisma.document.findUnique({
          where: { id: input.documentId },
          select: {
            id: true,
            documentCode: true,
            fileName: true,
            documentType: true,
            status: true,
            txHash: true,
            uploadedAt: true,
            fileHash: true
          }
        });

        if (!expectedDocument) {
          verificationStatus = "NOT_FOUND";
        } else if (expectedDocument.fileHash !== computedHash) {
          verificationStatus = "MISMATCH";
        } else if (expectedDocument.status === "revoked" || verifyChain.isRevoked) {
          verificationStatus = "REVOKED";
        } else {
          verificationStatus = "AUTHENTIC";
        }
      } else {
        if (!verifyChain.exists) {
          verificationStatus = "NOT_FOUND";
        } else if (verifyChain.isRevoked) {
          verificationStatus = "REVOKED";
        } else {
          verificationStatus = "AUTHENTIC";
        }
      }

      const verification = await prisma.verification.create({
        data: {
          documentId: matchedDocument?.id ?? expectedDocument?.id ?? null,
          verifierUserId: input.verifierUserId,
          uploadedFileName: input.file.originalname,
          computedHash,
          result: statusToDbResult(verificationStatus),
          notes:
            verificationStatus === "MISMATCH"
              ? "Expected document exists but uploaded file hash differs from registered hash."
              : verificationStatus === "NOT_FOUND"
                ? "No matching on-chain hash found for uploaded file."
                : undefined
        }
      });

      await auditService.createLog({
        action: "DOCUMENT_VERIFICATION_ATTEMPTED",
        documentId: matchedDocument?.id ?? expectedDocument?.id ?? undefined,
        actorUserId: input.verifierUserId,
        verifiedById: input.verifierUserId,
        metadataSnapshot: {
          verificationId: verification.id,
          verificationStatus,
          computedHash,
          expectedDocumentId: input.documentId ?? null,
          matchedOnChainDocumentId: verifyChain.documentId || null
        }
      });

      const responseDocument = expectedDocument ?? matchedDocument ?? null;

      return {
        verificationStatus,
        message: messageByStatus[verificationStatus],
        verificationRecord: {
          id: verification.id,
          comparedAt: verification.comparedAt
        },
        matchedDocument: responseDocument
          ? {
              id: responseDocument.id,
              documentCode: responseDocument.documentCode,
              fileName: responseDocument.fileName,
              documentType: responseDocument.documentType,
              status: responseDocument.status,
              txHash: responseDocument.txHash,
              uploadedAt: responseDocument.uploadedAt
            }
          : null,
        onChainProof: onChainByHash
          ? {
              documentId: onChainByHash.documentId,
              fileHash: onChainByHash.fileHash,
              isRevoked: onChainByHash.isRevoked,
              registeredAt: onChainByHash.registeredAt,
              revocationReason: onChainByHash.revokedReason || null
            }
          : null,
        timestamps: {
          verifiedAt: verification.comparedAt,
          onChainRegisteredAt: onChainByHash?.registeredAt ?? null
        },
        computedHash
      };
    } finally {
      await fs.unlink(input.file.path).catch(() => undefined);
    }
  },
  listHistory: async (query: {
    documentId?: string;
    result?: "authentic" | "tampered" | "revoked" | "not_found";
    page: number;
    limit: number;
  }) => {
    const skip = (query.page - 1) * query.limit;
    const where = {
      ...(query.documentId ? { documentId: query.documentId } : {}),
      ...(query.result ? { result: query.result } : {})
    };

    const [items, total] = await prisma.$transaction([
      prisma.verification.findMany({
        where,
        include: {
          verifier: {
            select: { id: true, email: true, fullName: true, role: true }
          },
          document: {
            select: { id: true, documentCode: true, fileName: true, status: true }
          }
        },
        orderBy: { comparedAt: "desc" },
        skip,
        take: query.limit
      }),
      prisma.verification.count({ where })
    ]);

    return {
      items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      }
    };
  }
};
