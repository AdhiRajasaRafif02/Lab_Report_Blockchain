import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { auditService } from "../audit/audit.service.js";

export const revocationService = {
  revokeDocument: async (input: { documentId: string; reason: string; revokedById: string }) => {
    const document = await prisma.document.findUnique({
      where: { id: input.documentId }
    });

    if (!document) {
      throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }
    if (document.status === "revoked") {
      throw new AppError("Document already revoked", 409, "DOCUMENT_ALREADY_REVOKED");
    }

    const result = await prisma.$transaction(async (tx) => {
      const revocation = await tx.revocation.create({
        data: {
          documentId: input.documentId,
          reason: input.reason,
          revokedById: input.revokedById
        }
      });

      const updatedDocument = await tx.document.update({
        where: { id: input.documentId },
        data: { status: "revoked" }
      });

      return { revocation, updatedDocument };
    });

    await auditService.createLog({
      action: "DOCUMENT_REVOKED",
      documentId: input.documentId,
      revokedById: input.revokedById,
      metadataSnapshot: {
        reason: input.reason
      }
    });

    return result;
  }
};
