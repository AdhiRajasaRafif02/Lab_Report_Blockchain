import { z } from "zod";

export const listAuditQuerySchema = z.object({
  action: z.string().optional(),
  documentId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  page: z.coerce.number().int().positive().default(1)
});
