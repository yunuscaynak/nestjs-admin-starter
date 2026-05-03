export const JWT_SECRET =
  process.env.JWT_SECRET ?? 'dev-secret-change-me-before-production';
export const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24;
