import type { UserSortOption } from "./types";

export const USER_SORT_OPTIONS: Array<{ label: string; value: UserSortOption }> = [
  { label: "En yeni", value: "createdAt:desc" },
  { label: "En eski", value: "createdAt:asc" },
  { label: "Ad (A-Z)", value: "firstName:asc" },
  { label: "Ad (Z-A)", value: "firstName:desc" },
  { label: "E-posta (A-Z)", value: "email:asc" },
  { label: "E-posta (Z-A)", value: "email:desc" },
];
