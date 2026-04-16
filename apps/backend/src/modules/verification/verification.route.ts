import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRoles } from "../../middlewares/role.middleware.js";
import { uploadSinglePdf } from "../../middlewares/upload.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { verificationController } from "./verification.controller.js";
import { verificationHistoryQuerySchema, verifyDocumentBodySchema } from "./verification.schema.js";

export const verificationRouter = Router();

verificationRouter.post(
  "/",
  requireAuth,
  requireRoles("admin", "verifier", "lab_staff", "user"),
  uploadSinglePdf,
  validate(verifyDocumentBodySchema),
  asyncHandler(verificationController.verifyDocument)
);

verificationRouter.get(
  "/history",
  requireAuth,
  validate(verificationHistoryQuerySchema, "query"),
  asyncHandler(verificationController.getHistory)
);
