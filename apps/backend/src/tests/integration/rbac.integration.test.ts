import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { prismaMock } from "../mocks/prisma.mock.js";

vi.mock("../../lib/prisma.js", () => ({
  prisma: prismaMock
}));

import { createApp } from "../../app.js";

const app = createApp();
const secret = process.env.JWT_SECRET ?? "super_secret_testing_key_123";

const makeToken = (role: "admin" | "lab_staff" | "verifier" | "user") =>
  jwt.sign({ sub: `${role}-1`, email: `${role}@test.local`, role }, secret);

describe("RBAC integration", () => {
  it("blocks user role from document upload route", async () => {
    const res = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${makeToken("user")}`)
      .send({
        documentCode: "DOC-RBAC-1",
        documentType: "blood_test"
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("allows lab_staff to reach upload validation layer", async () => {
    const res = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${makeToken("lab_staff")}`)
      .send({
        documentCode: "DOC-RBAC-2",
        documentType: "blood_test"
      });

    expect(res.status).toBe(400);
  });

  it("blocks regular user from audit logs endpoint", async () => {
    const res = await request(app)
      .get("/api/audit")
      .set("Authorization", `Bearer ${makeToken("user")}`);

    expect(res.status).toBe(403);
  });
});
