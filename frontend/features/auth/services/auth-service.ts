"use client";

import type { HttpClient } from "@/features/shared/services/http-client";
import type {
  AuthPayload,
  AuthResponse,
  RegisterPayload,
} from "@/features/auth/types";
import type { UserRecord } from "@/features/users/types";

export function refreshAuthSession(
  httpClient: HttpClient,
  refreshToken: string,
): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>(
    "/auth/refresh",
    { refreshToken },
    { auth: false },
  );
}

export function fetchCurrentUser(httpClient: HttpClient): Promise<UserRecord> {
  return httpClient.get<UserRecord>("/auth/me", {
    cache: "no-store",
  });
}

export function login(
  httpClient: HttpClient,
  payload: AuthPayload,
): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>("/auth/login", payload, {
    auth: false,
  });
}

export function register(
  httpClient: HttpClient,
  payload: RegisterPayload,
): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>("/auth/register", payload, {
    auth: false,
  });
}

export function logout(
  httpClient: HttpClient,
  refreshToken: string,
): Promise<{ success: true }> {
  return httpClient.post<{ success: true }>(
    "/auth/logout",
    { refreshToken },
    { auth: false },
  );
}
