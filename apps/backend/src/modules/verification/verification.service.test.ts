import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../tests/mocks/prisma.mock.js";

const { blockchainServiceMock, auditServiceMock } = vi.hoisted(() => ({
  blockchainServiceMock: {
    verifyDocumentHash: vi.fn(),
    getDocumentByHash: vi.fn()
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

import { verificationService } from "./verification.service.js";

const createTempPdf = async (name: string, content: string) => {
  const filePath = path.join(os.tmpdir(), `${Date.now()}-${name}.pdf`);
  await fs.writeFile(filePath, content, "utf8");
  return filePath;
};

describe("verificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns AUTHENTIC when hash exists and active", async () => {
    const filePath = await createTempPdf("authentic", "authentic-content");
    blockchainServiceMock.verifyDocumentHash.mockResolvedValue({
      exists: true,
      isRevoked: false,
      documentId: "doc1"
    });
    blockchainServiceMock.getDocumentByHash.mockResolvedValue({
      documentId: "doc1",
      fileHash: "abc",
      isRevoked: false,
      registeredAt: new Date(),
      revokedReason: ""
    });
    prismaMock.document.findFirst.mockResolvedValue({
      id: "doc1",
      documentCode: "DOC-1",
      fileName: "f.pdf",
      documentType: "blood_test",
      status: "active",
      txHash: "0xtx",
      uploadedAt: new Date(),
      fileHash: "abc"
    });
    prismaMock.verification.create.mockResolvedValue({
      id: "v1",
      comparedAt: new Date()
    });

    const res = await verificationService.verifyUploadedFile({
      verifierUserId: "u1",
      file: { path: filePath, originalname: "f.pdf", mimetype: "application/pdf", size: 10 } as Express.Multer.File
    });

    expect(res.verificationStatus).toBe("AUTHENTIC");
    expect(auditServiceMock.createLog).toHaveBeenCalledTimes(1);
    await expect(fs.access(filePath)).rejects.toBeTruthy();
  });

  it("returns REVOKED when hash exists but revoked", async () => {
    const filePath = await createTempPdf("revoked", "revoked-content");
    blockchainServiceMock.verifyDocumentHash.mockResolvedValue({
      exists: true,
      isRevoked: true,
      documentId: "doc2"
    });
    blockchainServiceMock.getDocumentByHash.mockResolvedValue({
      documentId: "doc2",
      fileHash: "abc",
      isRevoked: true,
      registeredAt: new Date(),
      revokedReason: "invalid"
    });
    prismaMock.document.findFirst.mockResolvedValue({
      id: "doc2",
      documentCode: "DOC-2",
      fileName: "f2.pdf",
      documentType: "blood_test",
      status: "revoked",
      txHash: "0xtx2",
      uploadedAt: new Date(),
      fileHash: "abc"
    });
    prismaMock.verification.create.mockResolvedValue({
      id: "v2",
      comparedAt: new Date()
    });

    const res = await verificationService.verifyUploadedFile({
      verifierUserId: "u1",
      file: { path: filePath, originalname: "f2.pdf", mimetype: "application/pdf", size: 10 } as Express.Multer.File
    });

    expect(res.verificationStatus).toBe("REVOKED");
    await expect(fs.access(filePath)).rejects.toBeTruthy();
  });

  it("returns MISMATCH when expected document hash differs", async () => {
    const filePath = await createTempPdf("mismatch", "mismatch-content");
    blockchainServiceMock.verifyDocumentHash.mockResolvedValue({
      exists: false,
      isRevoked: false,
      documentId: ""
    });
    blockchainServiceMock.getDocumentByHash.mockResolvedValue(null);
    prismaMock.document.findUnique.mockResolvedValue({
      id: "doc3",
      documentCode: "DOC-3",
      fileName: "f3.pdf",
      documentType: "blood_test",
      status: "active",
      txHash: null,
      uploadedAt: new Date(),
      fileHash: "different-hash"
    });
    prismaMock.verification.create.mockResolvedValue({
      id: "v3",
      comparedAt: new Date()
    });

    const res = await verificationService.verifyUploadedFile({
      verifierUserId: "u1",
      documentId: "doc3",
      file: { path: filePath, originalname: "f3.pdf", mimetype: "application/pdf", size: 10 } as Express.Multer.File
    });

    expect(res.verificationStatus).toBe("MISMATCH");
  });

  it("returns NOT_FOUND when no hash match", async () => {
    const filePath = await createTempPdf("notfound", "nothing");
    blockchainServiceMock.verifyDocumentHash.mockResolvedValue({
      exists: false,
      isRevoked: false,
      documentId: ""
    });
    blockchainServiceMock.getDocumentByHash.mockResolvedValue(null);
    prismaMock.verification.create.mockResolvedValue({
      id: "v4",
      comparedAt: new Date()
    });

    const res = await verificationService.verifyUploadedFile({
      verifierUserId: "u1",
      file: { path: filePath, originalname: "nf.pdf", mimetype: "application/pdf", size: 10 } as Express.Multer.File
    });

    expect(res.verificationStatus).toBe("NOT_FOUND");
  });
});
