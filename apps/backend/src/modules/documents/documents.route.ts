import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRoles } from "../../middlewares/role.middleware.js";
import { uploadSinglePdf } from "../../middlewares/upload.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { documentsController } from "./documents.controller.js";
import {
  createDocumentBodySchema,
  documentIdParamSchema,
  listDocumentsQuerySchema
} from "./documents.schema.js";

export const documentsRouter = Router();

documentsRouter.post(
  "/",
  requireAuth,
  requireRoles("admin", "lab_staff"),
  uploadSinglePdf,
  validate(createDocumentBodySchema),
  asyncHandler(documentsController.createDocument)
);
documentsRouter.get(
  "/",
  requireAuth,
  validate(listDocumentsQuerySchema, "query"),
  asyncHandler(documentsController.listDocuments)
);
documentsRouter.get(
  "/:id",
  requireAuth,
  validate(documentIdParamSchema, "params"),
  asyncHandler(documentsController.getDocumentById)
);
