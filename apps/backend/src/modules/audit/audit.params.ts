import { z } from "zod";

export const documentAuditParamSchema = z.object({
  documentId: z.string().min(1)
});
