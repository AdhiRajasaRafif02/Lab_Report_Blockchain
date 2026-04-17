import fs from "node:fs/promises";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { sha256Hex } from "../../utils/crypto.js";
import { auditService } from "../audit/audit.service.js";
import { blockchainService } from "../blockchain/blockchain.service.js";
import type { ListDocumentsQuery } from "./documents.types.js";

const mapDateRange = (fromDate?: string, toDate?: string) => {
  if (!fromDate && !toDate) return undefined;
  return {
    ...(fromDate ? { gte: new Date(fromDate) } : {}),
    ...(toDate ? { lte: new Date(toDate) } : {})
  };
};

export const documentsService = {
  createDocument: async (input: {
    uploaderId: string;
    file: Express.Multer.File | undefined;
    body: {
      documentCode: string;
      documentType: string;
      institutionName?: string;
    };
  }) => {
    if (!input.file) {
      throw new AppError("File is required", 400, "FILE_REQUIRED");
    }

    const existingCode = await prisma.document.findUnique({
      where: { documentCode: input.body.documentCode }
    });
    if (existingCode) {
      throw new AppError("Document code already exists", 409, "DOCUMENT_CODE_EXISTS");
    }

    const fileBuffer = await fs.readFile(input.file.path);
    const fileHash = sha256Hex(fileBuffer);

    const existingHash = await prisma.document.findFirst({
      where: { fileHash }
    });
    if (existingHash) {
      throw new AppError("This exact file hash is already registered", 409, "DOCUMENT_HASH_EXISTS");
    }

    // Files stay off-chain for cost/privacy; chain stores hash proof for integrity and provenance.
    const created = await prisma.document.create({
      data: {
        documentCode: input.body.documentCode,
        fileName: input.file.originalname,
        mimeType: input.file.mimetype,
        documentType: input.body.documentType,
        institutionName: input.body.institutionName,
        filePath: input.file.path,
        fileHash,
        uploadedById: input.uploaderId
      },
      include: {
        uploadedBy: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    });

    try {
      // Hash is registered on-chain to provide immutable integrity proof and timestamp provenance.
      const chainResult = await blockchainService.registerDocument({
        documentId: created.id,
        fileHash,
        fileName: created.fileName,
        documentType: created.documentType,
        institutionName: created.institutionName ?? undefined
      });

      await prisma.document.update({
        where: { id: created.id },
        data: {
          txHash: chainResult.txHash,
          blockNumber: BigInt(chainResult.blockNumber),
          chainTimestamp: new Date()
        }
      });

      await auditService.createLog({
        action: "DOCUMENT_UPLOADED",
        documentId: created.id,
        uploadedById: input.uploaderId,
        metadataSnapshot: {
          documentCode: created.documentCode,
          fileName: created.fileName,
          fileHash: created.fileHash,
          txHash: chainResult.txHash
        }
      });
    } catch (error) {
      // Keep DB/chain consistency: if chain write fails, remove DB record and uploaded file.
      await prisma.document.delete({ where: { id: created.id } });
      await fs.unlink(input.file.path).catch(() => undefined);
      throw error;
    }

    const finalDocument = await prisma.document.findUnique({
      where: { id: created.id },
      include: {
        uploadedBy: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    });
    if (!finalDocument) {
      throw new AppError("Document not found after registration", 500, "DOCUMENT_PERSISTENCE_ERROR");
    }
    return finalDocument;
  },
  getDocumentById: async (id: string) => {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        revocation: true,
        auditTrails: {
          orderBy: { createdAt: "desc" },
          take: 100
        }
      }
    });

    if (!document) {
      throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    const onChain = await blockchainService.getDocumentById(document.id);
    if (!onChain) {
      throw new AppError("Document metadata is missing on blockchain", 409, "BLOCKCHAIN_RECORD_MISSING");
    }
    return {
      ...document,
      onChain
    };
  },
  listDocuments: async (query: ListDocumentsQuery) => {
    const where: Prisma.DocumentWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.documentType ? { documentType: query.documentType } : {}),
      ...(query.ownerId ? { uploadedById: query.ownerId } : {}),
      ...(query.fromDate || query.toDate ? { uploadedAt: mapDateRange(query.fromDate, query.toDate) } : {})
    };

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await prisma.$transaction([
      prisma.document.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, email: true, fullName: true, role: true }
          }
        },
        orderBy: { uploadedAt: "desc" },
        skip,
        take: query.limit
      }),
      prisma.document.count({ where })
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
