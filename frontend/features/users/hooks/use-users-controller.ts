"use client";

import { useCallback, useEffect, useState } from "react";
import type { HttpClient } from "@/features/shared/services/http-client";
import type {
  UserRecord,
} from "@/features/users/types";
import {
  createUser,
  deleteUser,
  listUserAuthorOptions,
  listUsers,
  updateUser,
} from "../services/user-service";
import { useUserFilters } from "./use-user-filters";
import { useUserFormState } from "./use-user-form-state";

export function useUsersController({
  isAdmin,
  sessionToken,
  apiClient,
}: {
  isAdmin: boolean;
  sessionToken: string | null;
  apiClient: HttpClient;
}) {
  const [items, setItems] = useState<UserRecord[]>([]);
  const [authorOptions, setAuthorOptions] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const filters = useUserFilters();
  const formState = useUserFormState();
  const { page, setPage, limit, sort, filterDrawerOpen, listQuery } = filters;

  const loadUsers = useCallback(async () => {
    if (!sessionToken || !isAdmin) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await listUsers(apiClient, listQuery);

      if (data.items.length === 0 && page > 1) {
        setPage((previousPage) => Math.max(1, previousPage - 1));
        return;
      }

      setItems(data.items);
      setTotal(data.meta.total);
      setHasNextPage(page < data.meta.totalPages);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanicilar alinamadi.",
      );
      setItems([]);
      setTotal(0);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [apiClient, isAdmin, listQuery, page, sessionToken, setPage]);

  const loadAuthorOptions = useCallback(async () => {
    if (!sessionToken || !isAdmin) {
      return;
    }

    try {
      const data = await listUserAuthorOptions(apiClient);
      setAuthorOptions(data.items);
    } catch {
      setAuthorOptions([]);
    }
  }, [apiClient, isAdmin, sessionToken]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    queueMicrotask(() => {
      void loadUsers();
      void loadAuthorOptions();
    });
  }, [isAdmin, loadAuthorOptions, loadUsers]);

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await createUser(apiClient, {
        firstName: formState.createForm.firstName,
        lastName: formState.createForm.lastName,
        email: formState.createForm.email,
        password: formState.createForm.password,
        role: formState.createForm.role,
      });

      formState.resetCreateForm();
      setDrawerOpen(false);
      await loadUsers();
      await loadAuthorOptions();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanici olusturulamadi.",
      );
    }
  }

  function openDrawer() {
    formState.resetEditForm();
    formState.resetCreateForm();
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    formState.resetEditForm();
  }

  async function handleUpdateUser(id: string) {
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await updateUser(apiClient, id, {
        firstName: formState.editForm.firstName,
        lastName: formState.editForm.lastName,
        email: formState.editForm.email,
        role: formState.editForm.role,
        ...(formState.editForm.password.trim()
          ? { password: formState.editForm.password }
          : {}),
      });

      closeDrawer();
      await loadUsers();
      await loadAuthorOptions();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanici guncellenemedi.",
      );
    }
  }

  async function handleDeleteUser(id: string) {
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await deleteUser(apiClient, id);
      await loadUsers();
      await loadAuthorOptions();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanici silinemedi.",
      );
    }
  }

  const clearDisabled =
    loading ||
    (filters.filters.searchInput.trim().length === 0 &&
      filters.filters.appliedQuery.length === 0);

  return {
    items,
    error,
    loading,
    total,
    page,
    hasNextPage,
    limit,
    sort,
    appliedQuery: filters.filters.appliedQuery,
    clearDisabled,
    drawerOpen,
    filterDrawerOpen,
    isEditing: formState.editingId !== null,
    editingId: formState.editingId,
    authorOptions,
    openDrawer,
    closeDrawer,
    beginEdit: (user: UserRecord) => {
      formState.beginEdit(user);
      setDrawerOpen(true);
    },
    openFilterDrawer: filters.openFilterDrawer,
    closeFilterDrawer: filters.closeFilterDrawer,
    setPage: filters.setPage,
    setLimit: filters.setLimit,
    setSort: filters.setSort,
    deleteUser: handleDeleteUser,
    form: {
      ...formState.createForm,
      setFirstName: formState.setCreateFirstName,
      setLastName: formState.setCreateLastName,
      setEmail: formState.setCreateEmail,
      setPassword: formState.setCreatePassword,
      setRole: formState.setCreateRole,
      togglePassword: formState.toggleCreatePassword,
      submit: handleCreateUser,
    },
    editForm: {
      ...formState.editForm,
      setFirstName: formState.setEditFirstName,
      setLastName: formState.setEditLastName,
      setEmail: formState.setEditEmail,
      setPassword: formState.setEditPassword,
      setRole: formState.setEditRole,
      togglePassword: formState.toggleEditPassword,
      submit: handleUpdateUser,
    },
    filters: {
      searchInput: filters.filters.searchInput,
      setSearchInput: filters.setSearchInput,
      submit: (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        filters.applySearch();
      },
      clear: filters.clearSearch,
    },
  };
}

export type UsersController = ReturnType<typeof useUsersController>;
