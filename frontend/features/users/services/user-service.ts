"use client";

import type { HttpClient } from "@/features/shared/services/http-client";
import type {
  CreateUserPayload,
  ListUsersParams,
  UpdateUserPayload,
  UserRecord,
  UsersResponse,
} from "@/features/users/types";

export function listUsers(
  httpClient: HttpClient,
  query: ListUsersParams,
): Promise<UsersResponse> {
  return httpClient.get<UsersResponse>("/users", {
    cache: "no-store",
    query,
  });
}

export function listUserAuthorOptions(
  httpClient: HttpClient,
): Promise<UsersResponse> {
  return httpClient.get<UsersResponse>("/users", {
    cache: "no-store",
    query: {
      page: 1,
      limit: 100,
      sort: "firstName:asc",
    },
  });
}

export function createUser(
  httpClient: HttpClient,
  payload: CreateUserPayload,
): Promise<UserRecord> {
  return httpClient.post<UserRecord>("/users", payload);
}

export function updateUser(
  httpClient: HttpClient,
  id: string,
  payload: UpdateUserPayload,
): Promise<UserRecord> {
  return httpClient.patch<UserRecord>(`/users/${id}`, payload);
}

export function deleteUser(
  httpClient: HttpClient,
  id: string,
): Promise<UserRecord> {
  return httpClient.delete<UserRecord>(`/users/${id}`);
}
