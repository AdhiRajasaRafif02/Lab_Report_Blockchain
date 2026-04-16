import { Router } from "express";
import { authRouter } from "./auth.route.js";

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({ name: "Lab Report Blockchain API", version: "0.1.0" });
});

apiRouter.use("/auth", authRouter);
