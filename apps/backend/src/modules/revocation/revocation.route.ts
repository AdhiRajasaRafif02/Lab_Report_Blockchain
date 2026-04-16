import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRoles } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { revocationController } from "./revocation.controller.js";
import { revokeDocumentBodySchema, revokeDocumentParamSchema } from "./revocation.schema.js";

export const revocationRouter = Router();

revocationRouter.post(
  "/:documentId",
  requireAuth,
  requireRoles("admin", "lab_staff"),
  validate(revokeDocumentParamSchema, "params"),
  validate(revokeDocumentBodySchema),
  asyncHandler(revocationController.revokeDocument)
);
