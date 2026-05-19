function assertApiBaseUrl(value: string) {
  if (!value.endsWith("/api")) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL must include the /api prefix. Example: http://localhost:3002/api",
    );
  }
}

export function getApiBaseUrl() {
  const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!configuredApiBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is required. Define it in frontend/.env.",
    );
  }

  const normalizedApiBaseUrl = configuredApiBaseUrl.replace(/\/$/, "");
  assertApiBaseUrl(normalizedApiBaseUrl);

  return normalizedApiBaseUrl;
}
