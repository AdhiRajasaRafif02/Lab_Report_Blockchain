import { Router } from "express";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";

export const authRouter = Router();

type DemoUser = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "lab_staff" | "verifier" | "user";
  password: string;
};

const users = new Map<string, DemoUser>();
users.set("admin@lab.local", {
  id: "demo-admin-1",
  email: "admin@lab.local",
  fullName: "Demo Admin",
  role: "admin",
  password: "admin1234"
});

const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  role: z.enum(["admin", "lab_staff", "verifier", "user"]).default("user"),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const buildToken = (user: DemoUser) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role, fullName: user.fullName },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

authRouter.post("/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.flatten() });
  }

  const { email, fullName, role, password } = parsed.data;
  if (users.has(email)) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const user: DemoUser = {
    id: randomUUID(),
    email,
    fullName,
    role,
    password
  };

  users.set(email, user);
  const token = buildToken(user);

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
  });
});

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.flatten() });
  }

  const user = users.get(parsed.data.email);
  if (!user || user.password !== parsed.data.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = buildToken(user);
  return res.json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
  });
});

authRouter.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing bearer token" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    return res.json({ user: payload });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});
