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

export type UsersResponse = {
  items: UserRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type PostRecord = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type PostsResponse = {
  items: PostRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rememberMe: boolean;
  role: Role;
  user: UserRecord;
};

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rememberMe: boolean;
};

export type ApiError = {
  message?: string | string[];
};

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

export type PostSortOption =
  | "title:asc"
  | "title:desc"
  | "createdAt:asc"
  | "createdAt:desc"
  | "updatedAt:asc"
  | "updatedAt:desc";

export type SortOption<T> = {
  label: string;
  value: T;
};
