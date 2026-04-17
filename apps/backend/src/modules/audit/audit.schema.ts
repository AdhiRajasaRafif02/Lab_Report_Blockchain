import { z } from "zod";

export const listAuditQuerySchema = z.object({
  action: z
    .enum([
      "DOCUMENT_UPLOADED",
      "DOCUMENT_REGISTERED_ON_CHAIN",
      "DOCUMENT_VIEWED",
      "DOCUMENT_VERIFICATION_ATTEMPTED",
      "DOCUMENT_REVOKED"
    ])
    .optional(),
  documentId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  page: z.coerce.number().int().positive().default(1)
});
