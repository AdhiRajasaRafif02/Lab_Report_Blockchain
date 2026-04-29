import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../tests/mocks/prisma.mock.js";

const { blockchainServiceMock, auditServiceMock } = vi.hoisted(() => ({
  blockchainServiceMock: {
    revokeDocument: vi.fn()
  },
  auditServiceMock: {
    createLog: vi.fn()
  }
}));

vi.mock("../../lib/prisma.js", () => ({
  prisma: prismaMock
}));
vi.mock("../blockchain/blockchain.service.js", () => ({
  blockchainService: blockchainServiceMock
}));
vi.mock("../audit/audit.service.js", () => ({
  auditService: auditServiceMock
}));

import { revocationService } from "./revocation.service.js";
import { AppError } from "../../utils/app-error.js";

describe("revocationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revokes document and writes audit log", async () => {
    prismaMock.document.findUnique.mockResolvedValue({
      id: "doc1",
      status: "active"
    });
    blockchainServiceMock.revokeDocument.mockResolvedValue({
      txHash: "0xtx",
      blockNumber: 11
    });
    prismaMock.$transaction.mockImplementation(async (cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock));
    prismaMock.revocation.create.mockResolvedValue({ id: "r1" });
    prismaMock.document.update.mockResolvedValue({ id: "doc1", status: "revoked" });

    const result = await revocationService.revokeDocument({
      documentId: "doc1",
      reason: "Invalid report",
      revokedById: "admin1"
    });

    expect(result).toBeTruthy();
    expect(auditServiceMock.createLog).toHaveBeenCalledTimes(1);
  });

  it("prevents revoking already revoked document", async () => {
    prismaMock.document.findUnique.mockResolvedValue({
      id: "doc1",
      status: "revoked"
    });

    await expect(
      revocationService.revokeDocument({
        documentId: "doc1",
        reason: "Again",
        revokedById: "admin1"
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
