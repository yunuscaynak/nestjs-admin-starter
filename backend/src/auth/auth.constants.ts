export const JWT_SECRET =
  process.env.JWT_SECRET ?? 'dev-secret-change-me-before-production';
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ??
  'dev-refresh-secret-change-me-before-production';
export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 15;
export const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 24;
export const REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 30;
