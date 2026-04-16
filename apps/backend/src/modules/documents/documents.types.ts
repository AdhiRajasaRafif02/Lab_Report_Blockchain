export type ListDocumentsQuery = {
  status?: "active" | "revoked";
  documentType?: string;
  ownerId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
};
