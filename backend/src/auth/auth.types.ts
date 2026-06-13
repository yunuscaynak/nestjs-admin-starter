import { Role } from '@prisma/client';

export type JwtTokenType = 'access' | 'refresh';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  tokenType: JwtTokenType;
  rememberMe: boolean;
  iat?: number;
  exp?: number;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
  rememberMe: boolean;
};
