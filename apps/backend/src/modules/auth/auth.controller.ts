import type { Request, Response } from "express";
import { authService } from "./auth.service.js";

export const authController = {
  register: async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result
    });
  },
  login: async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      message: "Login successful",
      data: result
    });
  },
  me: async (req: Request, res: Response) => {
    const result = await authService.me(req.authUser!.id);
    res.json({
      success: true,
      message: "Current user fetched",
      data: result
    });
  }
};
