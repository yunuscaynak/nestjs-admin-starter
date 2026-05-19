"use client";

import type { ApiClient } from "@/features/shared/services/api-client";
import type { AuthResponse, UserRecord } from "@/features/shared/lib/types";

type AuthPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type RegisterPayload = AuthPayload & {
  firstName: string;
  lastName: string;
};

export function refreshAuthSession(apiClient: ApiClient, refreshToken: string) {
  return apiClient.post<AuthResponse>(
    "/auth/refresh",
    { refreshToken },
    { auth: false },
  );
}

export function fetchCurrentUser(apiClient: ApiClient) {
  return apiClient.get<UserRecord>("/auth/me", {
    cache: "no-store",
  });
}

export function login(apiClient: ApiClient, payload: AuthPayload) {
  return apiClient.post<AuthResponse>("/auth/login", payload, {
    auth: false,
  });
}

export function register(apiClient: ApiClient, payload: RegisterPayload) {
  return apiClient.post<AuthResponse>("/auth/register", payload, {
    auth: false,
  });
}

export function logout(apiClient: ApiClient, refreshToken: string) {
  return apiClient.post<void>(
    "/auth/logout",
    { refreshToken },
    { auth: false },
  );
}
