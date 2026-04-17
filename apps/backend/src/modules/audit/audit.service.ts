import type { AuditAction } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { AuditMetadata } from "./audit.types.js";

type ListAuditInput = {
  action?: AuditAction;
  documentId?: string;
  limit: number;
  page: number;
};

export const auditService = {
  createLog: async (input: {
    action: AuditAction;
    documentId?: string;
    actorUserId?: string;
    uploadedById?: string;
    verifiedById?: string;
    revokedById?: string;
    metadataSnapshot?: AuditMetadata;
  }) => {
    return prisma.auditTrail.create({
      data: {
        action: input.action,
        documentId: input.documentId,
        actorUserId: input.actorUserId,
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
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true
            }
          }
        },
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
  },
  getDocumentAuditHistory: async (documentId: string) => {
    return prisma.auditTrail.findMany({
      where: { documentId },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
};
