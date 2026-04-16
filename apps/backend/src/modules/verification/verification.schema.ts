import { z } from "zod";

export const verifyDocumentBodySchema = z.object({
  documentId: z.string().optional()
});

export const verificationHistoryQuerySchema = z.object({
  documentId: z.string().optional(),
  result: z.enum(["authentic", "tampered", "revoked", "not_found"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
