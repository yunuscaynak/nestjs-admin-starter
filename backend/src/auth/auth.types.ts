import { Role } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
};
