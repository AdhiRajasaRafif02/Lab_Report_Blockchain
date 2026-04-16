import type { Request, Response } from "express";
import { revocationService } from "./revocation.service.js";

export const revocationController = {
  revokeDocument: async (req: Request, res: Response) => {
    const result = await revocationService.revokeDocument({
      documentId: req.params.documentId,
      reason: req.body.reason,
      revokedById: req.authUser!.id
    });

    res.json({
      success: true,
      message: "Document revoked successfully",
      data: result
    });
  }
};
