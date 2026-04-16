import fs from "node:fs/promises";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { sha256Hex } from "../../utils/crypto.js";
import { auditService } from "../audit/audit.service.js";
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

    await auditService.createLog({
      action: "DOCUMENT_UPLOADED",
      documentId: created.id,
      uploadedById: input.uploaderId,
      metadataSnapshot: {
        documentCode: created.documentCode,
        fileName: created.fileName,
        fileHash: created.fileHash
      }
    });

    return created;
  },
  getDocumentById: async (id: string) => {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        revocation: true
      }
    });

    if (!document) {
      throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    return document;
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
