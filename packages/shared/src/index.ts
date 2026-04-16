export type UserRole = "admin" | "lab_staff" | "verifier" | "user";

export type DocumentStatus = "active" | "revoked";

export type VerifyResult = "authentic" | "tampered" | "revoked" | "not_found";
