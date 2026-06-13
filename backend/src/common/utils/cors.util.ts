const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

function getLocalApiOrigins(port: string): string[] {
  return [`http://localhost:${port}`, `http://127.0.0.1:${port}`];
}

export function getCorsOrigins(): string[] {
  const port = process.env.PORT?.trim() || '3002';
  const rawOrigins = process.env.CORS_ORIGINS;
  const localApiOrigins = getLocalApiOrigins(port);

  if (!rawOrigins) {
    return [...DEFAULT_CORS_ORIGINS, ...localApiOrigins];
  }

  const origins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return [...DEFAULT_CORS_ORIGINS, ...localApiOrigins];
  }

  return [...new Set([...origins, ...localApiOrigins])];
}
