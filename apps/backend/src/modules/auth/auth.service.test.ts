import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { prismaMock } from "../../tests/mocks/prisma.mock.js";

vi.mock("../../lib/prisma.js", () => ({
  prisma: prismaMock
}));

import { authService } from "./auth.service.js";
import { AppError } from "../../utils/app-error.js";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers new user and returns token payload", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "u1",
      email: "test@example.com",
      fullName: "Test User",
      role: "user"
    });

    const result = await authService.register({
      email: "test@example.com",
      fullName: "Test User",
      password: "password123"
    });

    expect(result.user.email).toBe("test@example.com");
    expect(result.token).toBeTypeOf("string");
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
  });

  it("prevents duplicate email registration", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "existing" });

    await expect(
      authService.register({
        email: "dup@example.com",
        fullName: "Dup",
        password: "password123"
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("logs in existing user with valid password", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u2",
      email: "login@example.com",
      fullName: "Login User",
      role: "admin",
      passwordHash
    });

    const result = await authService.login({
      email: "login@example.com",
      password: "password123"
    });

    expect(result.user.role).toBe("admin");
    expect(result.token).toBeTypeOf("string");
  });

  it("rejects invalid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({
        email: "missing@example.com",
        password: "password123"
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
