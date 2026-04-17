import { http } from "./http";
import type { ApiResponse, AuthPayload, AuthUser } from "../types/api";

export const authService = {
  async login(payload: { email: string; password: string }) {
    const res = await http.post<ApiResponse<AuthPayload>>("/auth/login", payload);
    return res.data.data;
  },
  async register(payload: { email: string; password: string; fullName: string; role?: AuthUser["role"] }) {
    const res = await http.post<ApiResponse<AuthPayload>>("/auth/register", payload);
    return res.data.data;
  },
  async me() {
    const res = await http.get<ApiResponse<AuthUser>>("/auth/me");
    return res.data.data;
  }
};
