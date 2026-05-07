import type { PostSortOption, SortOption, UserSortOption } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002/api";

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
