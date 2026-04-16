import type { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";

export const usersService = {
  listUsers: async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "asc" }
    });
  },
  updateUserRole: async (id: string, role: UserRole) => {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true
      }
    });
  }
};
