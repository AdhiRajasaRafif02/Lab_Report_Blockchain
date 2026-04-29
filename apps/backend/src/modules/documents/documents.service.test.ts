import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../tests/mocks/prisma.mock.js";

const { blockchainServiceMock, auditServiceMock } = vi.hoisted(() => ({
  blockchainServiceMock: {
    registerDocument: vi.fn(),
    getDocumentById: vi.fn()
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

import { documentsService } from "./documents.service.js";
import { AppError } from "../../utils/app-error.js";

const createTempPdf = async (name: string, content: string) => {
  const filePath = path.join(os.tmpdir(), `${Date.now()}-${name}.pdf`);
  await fs.writeFile(filePath, content, "utf8");
  return filePath;
};

describe("documentsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates document, computes hash, registers on-chain, and writes audit logs", async () => {
    const content = "sample content";
    const expectedHash = createHash("sha256").update(content).digest("hex");
    const filePath = await createTempPdf("upload", content);

    prismaMock.document.findUnique.mockResolvedValue(null);
    prismaMock.document.findFirst.mockResolvedValue(null);
    prismaMock.document.create.mockResolvedValue({
      id: "doc1",
      documentCode: "DOC-1",
      fileName: "file.pdf",
      documentType: "blood_test",
      institutionName: "Lab",
      fileHash: "hash",
      uploadedBy: { id: "u1", email: "u@test.com", fullName: "User", role: "lab_staff" }
    });
    blockchainServiceMock.registerDocument.mockResolvedValue({
      txHash: "0xtx",
      blockNumber: 10
    });
    prismaMock.document.update.mockResolvedValue({});
    prismaMock.document.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "doc1"
    });

    const result = await documentsService.createDocument({
      uploaderId: "u1",
      body: {
        documentCode: "DOC-1",
        documentType: "blood_test",
        institutionName: "Lab"
      },
      file: {
        path: filePath,
        originalname: "file.pdf",
        mimetype: "application/pdf"
      } as Express.Multer.File
    });

    expect(blockchainServiceMock.registerDocument).toHaveBeenCalledTimes(1);
    expect(blockchainServiceMock.registerDocument).toHaveBeenCalledWith(
      expect.objectContaining({ fileHash: expectedHash })
    );
    expect(prismaMock.document.update).toHaveBeenCalledTimes(1);
    expect(auditServiceMock.createLog).toHaveBeenCalledTimes(2);
    expect(result).toBeTruthy();
    await fs.unlink(filePath).catch(() => undefined);
  });

  it("prevents duplicate hash registration", async () => {
    const filePath = await createTempPdf("dup", "duplicate");
    prismaMock.document.findUnique.mockResolvedValue(null);
    prismaMock.document.findFirst.mockResolvedValue({ id: "existing" });

    await expect(
      documentsService.createDocument({
        uploaderId: "u1",
        body: {
          documentCode: "DOC-2",
          documentType: "blood_test"
        },
        file: {
          path: filePath,
          originalname: "dup.pdf",
          mimetype: "application/pdf"
        } as Express.Multer.File
      })
    ).rejects.toBeInstanceOf(AppError);

    expect(blockchainServiceMock.registerDocument).not.toHaveBeenCalled();
    await fs.unlink(filePath).catch(() => undefined);
  });

  it("rolls back db and file when chain registration fails", async () => {
    const filePath = await createTempPdf("rollback", "rollback");
    prismaMock.document.findUnique.mockResolvedValue(null);
    prismaMock.document.findFirst.mockResolvedValue(null);
    prismaMock.document.create.mockResolvedValue({
      id: "doc3",
      documentCode: "DOC-3",
      fileName: "file.pdf",
      documentType: "blood_test",
      institutionName: "Lab",
      fileHash: "hash",
      uploadedBy: { id: "u1", email: "u@test.com", fullName: "User", role: "lab_staff" }
    });
    blockchainServiceMock.registerDocument.mockRejectedValue(new Error("chain down"));

    await expect(
      documentsService.createDocument({
        uploaderId: "u1",
        body: { documentCode: "DOC-3", documentType: "blood_test" },
        file: {
          path: filePath,
          originalname: "file.pdf",
          mimetype: "application/pdf"
        } as Express.Multer.File
      })
    ).rejects.toBeTruthy();

    expect(prismaMock.document.delete).toHaveBeenCalledWith({ where: { id: "doc3" } });
    await expect(fs.access(filePath)).rejects.toBeTruthy();
  });
});
