import fs from "node:fs/promises";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { sha256Hex } from "../../utils/crypto.js";
import { auditService } from "../audit/audit.service.js";

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

    const document = await prisma.document.findFirst({
      where: { fileHash: computedHash },
      include: { revocation: true }
    });

    let result: "authentic" | "tampered" | "revoked" | "not_found";
    if (!document) {
      result = "not_found";
    } else if (input.documentId && document.id !== input.documentId) {
      result = "tampered";
    } else if (document.status === "revoked") {
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
            ? "No matching registered hash found"
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
        computedHash
      }
    });

    return {
      verification,
      document,
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
