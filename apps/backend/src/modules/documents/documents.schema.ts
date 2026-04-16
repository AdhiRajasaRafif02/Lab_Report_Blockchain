import { z } from "zod";

export const createDocumentBodySchema = z.object({
  documentCode: z.string().min(2).max(80),
  documentType: z.string().min(2).max(120),
  institutionName: z.string().min(2).max(200).optional()
});

export const documentIdParamSchema = z.object({
  id: z.string().min(1)
});

export const listDocumentsQuerySchema = z.object({
  status: z.enum(["active", "revoked"]).optional(),
  documentType: z.string().optional(),
  ownerId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
