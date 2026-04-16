import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRoles } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { auditController } from "./audit.controller.js";
import { listAuditQuerySchema } from "./audit.schema.js";

export const auditRouter = Router();

auditRouter.get(
  "/",
  requireAuth,
  requireRoles("admin", "verifier"),
  validate(listAuditQuerySchema, "query"),
  asyncHandler(auditController.listAuditLogs)
);
