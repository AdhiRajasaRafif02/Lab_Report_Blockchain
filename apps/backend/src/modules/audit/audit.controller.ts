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
  }
};
