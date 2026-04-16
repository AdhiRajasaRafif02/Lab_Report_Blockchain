import { Router } from "express";
import { authRouter } from "./auth/auth.route.js";
import { auditRouter } from "./audit/audit.route.js";
import { documentsRouter } from "./documents/documents.route.js";
import { revocationRouter } from "./revocation/revocation.route.js";
import { usersRouter } from "./users/users.route.js";
import { verificationRouter } from "./verification/verification.route.js";

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Lab Report Blockchain API",
    data: { version: "0.1.0" }
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/documents", documentsRouter);
apiRouter.use("/verify", verificationRouter);
apiRouter.use("/audit", auditRouter);
apiRouter.use("/revocations", revocationRouter);
