import type { UserRecord } from "../users/types";

export type AuthPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type AuthFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
};

export type RegisterPayload = AuthPayload & {
  firstName: string;
  lastName: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rememberMe: boolean;
  role: UserRecord["role"];
  user: UserRecord;
};

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rememberMe: boolean;
};
