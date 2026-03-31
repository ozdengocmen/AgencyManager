import { requestJson } from "./client";
import type { UserRole } from "./types";

export interface AuthUserResponse {
  user_id: UserRole;
  role: UserRole;
  email: string;
  full_name: string;
  portfolio_scope: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
  language: "en" | "tr";
  portfolio_scope?: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: AuthUserResponse;
}

export interface MeResponse {
  user: AuthUserResponse;
  session_expires_at: string;
}

export function loginRequest(payload: LoginRequest): Promise<LoginResponse> {
  return requestJson<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutRequest(): Promise<{ success: boolean }> {
  return requestJson<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser(): Promise<MeResponse> {
  return requestJson<MeResponse>("/api/auth/me");
}
