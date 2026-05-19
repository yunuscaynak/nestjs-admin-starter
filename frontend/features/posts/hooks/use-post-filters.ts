"use client";

import { useMemo, useState } from "react";
import type {
  ListPostsParams,
  PostFilterValues,
  PostSortOption,
} from "@/features/posts/types";

const INITIAL_FILTERS: PostFilterValues = {
  searchInput: "",
  appliedQuery: "",
  published: "all",
  authorId: "all",
};

export function usePostFilters() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(20);
  const [sort, setSort] = useState<PostSortOption>("createdAt:desc");
  const [filters, setFilters] = useState<PostFilterValues>(INITIAL_FILTERS);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const listQuery = useMemo<ListPostsParams>(
    () => ({
      page,
      limit,
      sort,
      q: filters.appliedQuery || undefined,
      authorId: filters.authorId !== "all" ? filters.authorId : undefined,
      published: filters.published !== "all" ? filters.published : undefined,
    }),
    [filters.appliedQuery, filters.authorId, filters.published, limit, page, sort],
  );

  function applyFilters() {
    setFilters((current) => ({
      ...current,
      appliedQuery: current.searchInput.trim(),
    }));
    setPage(1);
    setFilterDrawerOpen(false);
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS);
    setPage(1);
    setFilterDrawerOpen(false);
  }

  return {
    page,
    limit,
    sort,
    filterDrawerOpen,
    filters,
    listQuery,
    openFilterDrawer: () => setFilterDrawerOpen(true),
    closeFilterDrawer: () => setFilterDrawerOpen(false),
    setPage,
    setLimit: (value: number) => {
      setLimit(value);
      setPage(1);
    },
    setSort: (value: PostSortOption) => {
      setSort(value);
      setPage(1);
    },
    setSearchInput: (value: string) =>
      setFilters((current) => ({ ...current, searchInput: value })),
    setPublishedFilter: (value: "all" | "true" | "false") => {
      setFilters((current) => ({ ...current, published: value }));
      setPage(1);
    },
    setAuthorFilter: (value: string) => {
      setFilters((current) => ({ ...current, authorId: value }));
      setPage(1);
    },
    applyFilters,
    clearFilters,
  };
}
