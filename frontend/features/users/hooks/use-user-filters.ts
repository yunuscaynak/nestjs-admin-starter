"use client";

import { useMemo, useState } from "react";
import type {
  ListUsersParams,
  UserFilterValues,
  UserSortOption,
} from "@/features/users/types";

const INITIAL_FILTERS: UserFilterValues = {
  searchInput: "",
  appliedQuery: "",
};

export function useUserFilters() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(20);
  const [sort, setSort] = useState<UserSortOption>("createdAt:desc");
  const [filters, setFilters] = useState<UserFilterValues>(INITIAL_FILTERS);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const listQuery = useMemo<ListUsersParams>(
    () => ({
      page,
      limit,
      sort,
      q: filters.appliedQuery || undefined,
    }),
    [filters.appliedQuery, limit, page, sort],
  );

  function applySearch() {
    setFilters((current) => ({
      ...current,
      appliedQuery: current.searchInput.trim(),
    }));
    setPage(1);
    setFilterDrawerOpen(false);
  }

  function clearSearch() {
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
    setSort: (value: UserSortOption) => {
      setSort(value);
      setPage(1);
    },
    setSearchInput: (value: string) =>
      setFilters((current) => ({ ...current, searchInput: value })),
    applySearch,
    clearSearch,
  };
}
