import { http } from "./http";
import type { ApiResponse, DocumentDetail, DocumentItem, Paginated } from "../types/api";

export const documentsService = {
  async uploadDocument(payload: {
    file: File;
    documentCode: string;
    documentType: string;
    institutionName?: string;
  }) {
    const form = new FormData();
    form.append("file", payload.file);
    form.append("documentCode", payload.documentCode);
    form.append("documentType", payload.documentType);
    if (payload.institutionName) form.append("institutionName", payload.institutionName);

    const res = await http.post<ApiResponse<DocumentItem>>("/documents", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.data;
  },
  async listDocuments(query: {
    status?: "active" | "revoked";
    documentType?: string;
    ownerId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await http.get<ApiResponse<Paginated<DocumentItem>>>("/documents", { params: query });
    return res.data.data;
  },
  async getDocumentById(id: string) {
    const res = await http.get<ApiResponse<DocumentDetail>>(`/documents/${id}`);
    return res.data.data;
  }
};
