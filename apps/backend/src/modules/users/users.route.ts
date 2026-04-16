import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRoles } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { usersController } from "./users.controller.js";
import { updateUserRoleSchema, userIdParamSchema } from "./users.schema.js";

export const usersRouter = Router();

usersRouter.get("/", requireAuth, requireRoles("admin"), asyncHandler(usersController.listUsers));
usersRouter.patch(
  "/:id/role",
  requireAuth,
  requireRoles("admin"),
  validate(userIdParamSchema, "params"),
  validate(updateUserRoleSchema),
  asyncHandler(usersController.updateUserRole)
);
