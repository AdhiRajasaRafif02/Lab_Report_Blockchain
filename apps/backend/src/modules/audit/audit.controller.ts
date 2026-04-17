import type { Request, Response } from "express";
import { auditService } from "./audit.service.js";

export const auditController = {
  listAuditLogs: async (req: Request, res: Response) => {
    const result = await auditService.listLogs(req.query as never);
    res.json({
      success: true,
      message: "Audit logs fetched",
      data: result
    });
  },
  getDocumentAuditHistory: async (req: Request, res: Response) => {
    const items = await auditService.getDocumentAuditHistory(req.params.documentId);
    res.json({
      success: true,
      message: "Document audit history fetched",
      data: items
    });
  }
};
