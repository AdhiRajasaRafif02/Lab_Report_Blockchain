import { vi } from "vitest";

export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn()
  },
  document: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn()
  },
  verification: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn()
  },
  revocation: {
    create: vi.fn()
  },
  auditTrail: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn()
  },
  $transaction: vi.fn()
};
