import type { Request, Response } from "express";
import { usersService } from "./users.service.js";

export const usersController = {
  listUsers: async (_req: Request, res: Response) => {
    const users = await usersService.listUsers();
    res.json({
      success: true,
      message: "Users fetched",
      data: users
    });
  },
  updateUserRole: async (req: Request, res: Response) => {
    const user = await usersService.updateUserRole(req.params.id, req.body.role);
    res.json({
      success: true,
      message: "User role updated",
      data: user
    });
  }
};
