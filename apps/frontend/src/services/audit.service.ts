import { http } from "./http";
import type { ApiResponse, AuditTrail, Paginated } from "../types/api";

export const auditService = {
  async listAuditLogs(query: { action?: string; documentId?: string; page?: number; limit?: number }) {
    const res = await http.get<ApiResponse<Paginated<AuditTrail>>>("/audit", {
      params: query
    });
    return res.data.data;
  },
  async getDocumentAuditHistory(documentId: string) {
    const res = await http.get<ApiResponse<AuditTrail[]>>(`/audit/document/${documentId}`);
    return res.data.data;
  }
};
