import type { PaginatedResponse } from "@/features/shared/lib/pagination";

export type Role = "ADMIN" | "USER";

export type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type UsersResponse = PaginatedResponse<UserRecord>;

export type UserSortOption =
  | "id:asc"
  | "id:desc"
  | "firstName:asc"
  | "firstName:desc"
  | "email:asc"
  | "email:desc"
  | "createdAt:asc"
  | "createdAt:desc"
  | "updatedAt:asc"
  | "updatedAt:desc";

export type ListUsersParams = {
  page: number;
  limit: number;
  sort: UserSortOption;
  q?: string;
};

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

export type UpdateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password?: string;
};

export type CreateUserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  showPassword: boolean;
};

export type EditUserFormValues = CreateUserFormValues;

export type UserFilterValues = {
  searchInput: string;
  appliedQuery: string;
};
