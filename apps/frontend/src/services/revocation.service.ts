import { http } from "./http";
import type { ApiResponse, DocumentItem, Revocation } from "../types/api";

type RevokeResponse = {
  revocation: Revocation;
  updatedDocument: DocumentItem;
};

export const revocationService = {
  async revokeDocument(documentId: string, reason: string) {
    const res = await http.post<ApiResponse<RevokeResponse>>(`/revocations/${documentId}`, { reason });
    return res.data.data;
  }
};
