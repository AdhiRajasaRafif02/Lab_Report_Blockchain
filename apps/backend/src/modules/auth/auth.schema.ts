import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  password: z.string().min(6).max(100),
  role: z.enum(["admin", "lab_staff", "verifier", "user"]).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});
