export type UserRole = "admin" | "lab_staff" | "verifier" | "user";
export type DocumentStatus = "active" | "revoked";
export type VerifyResult = "authentic" | "tampered" | "revoked" | "not_found";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type AuthPayload = {
  token: string;
  user: AuthUser;
};

export type UploadedBy = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type DocumentItem = {
  id: string;
  documentCode: string;
  fileName: string;
  mimeType: string;
  documentType: string;
  institutionName: string | null;
  filePath: string;
  fileHash: string;
  status: DocumentStatus;
  uploadedById: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  txHash: string | null;
  blockNumber: string | null;
  chainTimestamp: string | null;
  uploadedBy: UploadedBy;
};

export type OnChainDocument = {
  documentId: string;
  fileHash: string;
  fileName: string;
  documentType: string;
  uploader: string;
  institutionName: string;
  registeredAt: string;
  isRevoked: boolean;
  revokedReason: string;
};

export type AuditTrail = {
  id: string;
  action: string;
  documentId: string | null;
  uploadedById: string | null;
  verifiedById: string | null;
  revokedById: string | null;
  metadataSnapshot: Record<string, unknown> | null;
  createdAt: string;
};

export type Revocation = {
  id: string;
  documentId: string;
  reason: string;
  revokedById: string;
  revokedAt: string;
  txHash: string | null;
};

export type DocumentDetail = DocumentItem & {
  revocation: Revocation | null;
  onChain: OnChainDocument;
  auditTrails: AuditTrail[];
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type VerificationRecord = {
  id: string;
  documentId: string | null;
  verifierUserId: string | null;
  uploadedFileName: string;
  computedHash: string;
  result: VerifyResult;
  comparedAt: string;
  txHash: string | null;
  notes: string | null;
  document?: { id: string; documentCode: string; fileName: string; status: DocumentStatus } | null;
  verifier?: UploadedBy | null;
};

export type VerifyResponse = {
  verification: VerificationRecord;
  document: DocumentItem | null;
  onChain: OnChainDocument | null;
  result: VerifyResult;
};
