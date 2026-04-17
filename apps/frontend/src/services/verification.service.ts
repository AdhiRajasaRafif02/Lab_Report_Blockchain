import { http } from "./http";
import type { ApiResponse, Paginated, VerificationRecord, VerifyResponse } from "../types/api";

export const verificationService = {
  async verifyDocument(payload: { file: File; documentId?: string }) {
    const form = new FormData();
    form.append("file", payload.file);
    if (payload.documentId) {
      form.append("documentId", payload.documentId);
    }

    const res = await http.post<ApiResponse<VerifyResponse>>("/verify", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.data;
  },
  async getVerificationHistory(query: { documentId?: string; result?: string; page?: number; limit?: number }) {
    const res = await http.get<ApiResponse<Paginated<VerificationRecord>>>("/verify/history", { params: query });
    return res.data.data;
  }
};
