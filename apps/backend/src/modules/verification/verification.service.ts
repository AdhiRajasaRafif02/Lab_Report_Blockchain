import fs from "node:fs/promises";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { sha256Hex } from "../../utils/crypto.js";
import { auditService } from "../audit/audit.service.js";
import { blockchainService } from "../blockchain/blockchain.service.js";

export const verificationService = {
  verifyUploadedFile: async (input: {
    file: Express.Multer.File | undefined;
    verifierUserId: string;
    documentId?: string;
  }) => {
    if (!input.file) {
      throw new AppError("File is required", 400, "FILE_REQUIRED");
    }

    const fileBuffer = await fs.readFile(input.file.path);
    const computedHash = sha256Hex(fileBuffer);

    const verifyChain = await blockchainService.verifyDocumentHash(computedHash);
    const onChainDoc = verifyChain.exists
      ? await blockchainService.getDocumentByHash(computedHash)
      : null;
    if (verifyChain.exists && !onChainDoc) {
      throw new AppError(
        "Inconsistent blockchain state: hash exists but record lookup failed",
        409,
        "BLOCKCHAIN_INCONSISTENT_STATE"
      );
    }

    const document = verifyChain.exists
      ? await prisma.document.findFirst({
          where: { id: verifyChain.documentId },
          include: { revocation: true }
        })
      : null;

    let result: "authentic" | "tampered" | "revoked" | "not_found";
    if (!verifyChain.exists) {
      result = "not_found";
    } else if (input.documentId && verifyChain.documentId !== input.documentId) {
      result = "tampered";
    } else if (verifyChain.isRevoked) {
      result = "revoked";
    } else {
      result = "authentic";
    }

    const verification = await prisma.verification.create({
      data: {
        documentId: document?.id,
        verifierUserId: input.verifierUserId,
        uploadedFileName: input.file.originalname,
        computedHash,
        result,
        notes:
          result === "not_found"
            ? "No matching on-chain hash found"
            : result === "tampered"
              ? "Hash belongs to a different document than requested"
              : undefined
      }
    });

    await auditService.createLog({
      action: "DOCUMENT_VERIFIED",
      documentId: document?.id,
      verifiedById: input.verifierUserId,
      metadataSnapshot: {
        verificationId: verification.id,
        result: verification.result,
        computedHash,
        onChainDocumentId: verifyChain.documentId
      }
    });

    return {
      verification,
      document,
      onChain: onChainDoc,
      result
    };
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
