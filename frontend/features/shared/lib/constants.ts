import type { PostSortOption, SortOption, UserSortOption } from "./types";

const DEFAULT_API_BASE_URL = "http://localhost:3002/api";

function resolveApiBaseUrl() {
  const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!configuredApiBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  const normalizedApiBaseUrl = configuredApiBaseUrl.replace(/\/$/, "");

  if (!normalizedApiBaseUrl.endsWith("/api")) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL must include the /api prefix. Example: http://localhost:3002/api",
    );
  }

  return normalizedApiBaseUrl;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const SESSION_STORAGE_KEY = "nest-crud-session";
export const LIMIT_OPTIONS = [10, 20, 50, 100] as const;

export const USER_SORT_OPTIONS: Array<SortOption<UserSortOption>> = [
  { label: "En yeni", value: "createdAt:desc" },
  { label: "En eski", value: "createdAt:asc" },
  { label: "Ad (A-Z)", value: "firstName:asc" },
  { label: "Ad (Z-A)", value: "firstName:desc" },
  { label: "E-posta (A-Z)", value: "email:asc" },
  { label: "E-posta (Z-A)", value: "email:desc" },
];

export const POST_SORT_OPTIONS: Array<SortOption<PostSortOption>> = [
  { label: "En yeni", value: "createdAt:desc" },
  { label: "En eski", value: "createdAt:asc" },
  { label: "Baslik (A-Z)", value: "title:asc" },
  { label: "Baslik (Z-A)", value: "title:desc" },
  { label: "Son guncellenen", value: "updatedAt:desc" },
];
