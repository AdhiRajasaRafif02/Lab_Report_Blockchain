export type OnChainDocument = {
  documentId: string;
  fileHash: string;
  fileName: string;
  documentType: string;
  uploader: string;
  institutionName: string;
  registeredAt: Date;
  isRevoked: boolean;
  revokedReason: string;
};

export type VerifyHashResult = {
  exists: boolean;
  isRevoked: boolean;
  documentId: string;
};
