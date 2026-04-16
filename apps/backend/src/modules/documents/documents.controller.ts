import type { Request, Response } from "express";
import { documentsService } from "./documents.service.js";

export const documentsController = {
  createDocument: async (req: Request, res: Response) => {
    const document = await documentsService.createDocument({
      uploaderId: req.authUser!.id,
      file: req.file,
      body: req.body
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded and registered",
      data: document
    });
  },
  getDocumentById: async (req: Request, res: Response) => {
    const document = await documentsService.getDocumentById(req.params.id);
    res.json({
      success: true,
      message: "Document fetched",
      data: document
    });
  },
  listDocuments: async (req: Request, res: Response) => {
    const result = await documentsService.listDocuments(req.query as never);
    res.json({
      success: true,
      message: "Documents fetched",
      data: result
    });
  }
};
