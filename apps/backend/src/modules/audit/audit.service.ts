import { prisma } from "../../lib/prisma.js";
import type { AuditMetadata } from "./audit.types.js";

type ListAuditInput = {
  action?: string;
  documentId?: string;
  limit: number;
  page: number;
};

export const auditService = {
  createLog: async (input: {
    action: string;
    documentId?: string;
    uploadedById?: string;
    verifiedById?: string;
    revokedById?: string;
    metadataSnapshot?: AuditMetadata;
  }) => {
    return prisma.auditTrail.create({
      data: {
        action: input.action,
        documentId: input.documentId,
        uploadedById: input.uploadedById,
        verifiedById: input.verifiedById,
        revokedById: input.revokedById,
        metadataSnapshot: input.metadataSnapshot ?? undefined
      }
    });
  },
  listLogs: async (query: ListAuditInput) => {
    const skip = (query.page - 1) * query.limit;

    const where = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.documentId ? { documentId: query.documentId } : {})
    };

    const [items, total] = await prisma.$transaction([
      prisma.auditTrail.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit
      }),
      prisma.auditTrail.count({ where })
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
