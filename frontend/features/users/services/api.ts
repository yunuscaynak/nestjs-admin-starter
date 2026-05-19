"use client";

import type { ApiClient } from "@/features/shared/services/api-client";
import type {
  Role,
  UserSortOption,
  UsersResponse,
} from "@/features/shared/lib/types";

type ListUsersParams = {
  page: number;
  limit: number;
  sort: UserSortOption;
  q?: string;
};

type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

type UpdateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password?: string;
};

export function listUsers(apiClient: ApiClient, query: ListUsersParams) {
  return apiClient.get<UsersResponse>("/users", {
    cache: "no-store",
    query,
  });
}

export function listUserAuthorOptions(apiClient: ApiClient) {
  return apiClient.get<UsersResponse>("/users", {
    cache: "no-store",
    query: {
      page: 1,
      limit: 100,
      sort: "firstName:asc",
    },
  });
}

export function createUser(apiClient: ApiClient, payload: CreateUserPayload) {
  return apiClient.post("/users", payload);
}

export function updateUser(
  apiClient: ApiClient,
  id: string,
  payload: UpdateUserPayload,
) {
  return apiClient.patch(`/users/${id}`, payload);
}

export function deleteUser(apiClient: ApiClient, id: string) {
  return apiClient.delete(`/users/${id}`);
}
