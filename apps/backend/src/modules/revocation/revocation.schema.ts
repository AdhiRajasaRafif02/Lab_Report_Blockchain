import { z } from "zod";

export const revokeDocumentBodySchema = z.object({
  reason: z.string().min(5).max(500)
});

export const revokeDocumentParamSchema = z.object({
  documentId: z.string().min(1)
});
