import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "lab_staff", "verifier", "user"])
});

export const userIdParamSchema = z.object({
  id: z.string().min(1)
});
