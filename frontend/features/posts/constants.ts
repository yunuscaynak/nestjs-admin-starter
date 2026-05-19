import type { PostSortOption } from "./types";

export const POST_SORT_OPTIONS: Array<{ label: string; value: PostSortOption }> = [
  { label: "En yeni", value: "createdAt:desc" },
  { label: "En eski", value: "createdAt:asc" },
  { label: "Baslik (A-Z)", value: "title:asc" },
  { label: "Baslik (Z-A)", value: "title:desc" },
  { label: "Son guncellenen", value: "updatedAt:desc" },
];
