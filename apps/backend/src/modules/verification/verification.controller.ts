import type { Request, Response } from "express";
import { verificationService } from "./verification.service.js";

export const verificationController = {
  verifyDocument: async (req: Request, res: Response) => {
    const result = await verificationService.verifyUploadedFile({
      file: req.file,
      verifierUserId: req.authUser!.id,
      documentId: req.body.documentId
    });

    res.json({
      success: true,
      message: "Document verification completed",
      data: result
    });
  },
  getHistory: async (req: Request, res: Response) => {
    const result = await verificationService.listHistory(req.query as never);
    res.json({
      success: true,
      message: "Verification history fetched",
      data: result
    });
  }
};
