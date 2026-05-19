"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiClient } from "@/features/shared/services/api-client";
import type {
  Role,
  UserRecord,
  UserSortOption,
} from "@/features/shared/lib/types";
import {
  createUser,
  deleteUser,
  listUserAuthorOptions,
  listUsers,
  updateUser,
} from "../services/api";

export function useUsersController({
  isAdmin,
  sessionToken,
  apiClient,
}: {
  isAdmin: boolean;
  sessionToken: string | null;
  apiClient: ApiClient;
}) {
  const [items, setItems] = useState<UserRecord[]>([]);
  const [authorOptions, setAuthorOptions] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [role, setRole] = useState<Role>("USER");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(20);
  const [sort, setSort] = useState<UserSortOption>("createdAt:desc");
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRole, setEditRole] = useState<Role>("USER");
  const [total, setTotal] = useState(0);

  const listQuery = useMemo(
    () => ({
      page,
      limit,
      sort,
      q: appliedQuery || undefined,
    }),
    [appliedQuery, limit, page, sort],
  );

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
  }, [apiClient, isAdmin, listQuery, page, sessionToken]);

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

    void loadUsers();
    void loadAuthorOptions();
  }, [isAdmin, loadAuthorOptions, loadUsers]);

  function resetCreateForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setShowCreatePassword(false);
    setRole("USER");
  }

  function resetEditForm() {
    setEditingId(null);
    setEditFirstName("");
    setEditLastName("");
    setEditEmail("");
    setEditPassword("");
    setShowEditPassword(false);
    setEditRole("USER");
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await createUser(apiClient, {
        firstName,
        lastName,
        email,
        password,
        role,
      });

      resetCreateForm();
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
    resetEditForm();
    resetCreateForm();
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetEditForm();
  }

  function beginEdit(user: UserRecord) {
    setEditingId(user.id);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditEmail(user.email);
    setEditPassword("");
    setShowEditPassword(false);
    setEditRole(user.role);
    setDrawerOpen(true);
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedQuery(searchInput.trim());
    setPage(1);
    setFilterDrawerOpen(false);
  }

  function clearSearch() {
    setSearchInput("");
    setAppliedQuery("");
    setPage(1);
    setFilterDrawerOpen(false);
  }

  async function handleUpdateUser(id: string) {
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await updateUser(apiClient, id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        role: editRole,
        ...(editPassword.trim() ? { password: editPassword } : {}),
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
    loading || (searchInput.trim().length === 0 && appliedQuery.length === 0);

  return {
    items,
    error,
    loading,
    total,
    page,
    hasNextPage,
    limit,
    sort,
    appliedQuery,
    clearDisabled,
    drawerOpen,
    filterDrawerOpen,
    isEditing: editingId !== null,
    editingId,
    authorOptions,
    openDrawer,
    closeDrawer,
    beginEdit,
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
    deleteUser: handleDeleteUser,
    form: {
      firstName,
      lastName,
      email,
      password,
      role,
      showPassword: showCreatePassword,
      setFirstName,
      setLastName,
      setEmail,
      setPassword,
      setRole,
      togglePassword: () => setShowCreatePassword((current) => !current),
      submit: handleCreateUser,
    },
    editForm: {
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      password: editPassword,
      role: editRole,
      showPassword: showEditPassword,
      setFirstName: setEditFirstName,
      setLastName: setEditLastName,
      setEmail: setEditEmail,
      setPassword: setEditPassword,
      setRole: setEditRole,
      togglePassword: () => setShowEditPassword((current) => !current),
      submit: handleUpdateUser,
    },
    filters: {
      searchInput,
      setSearchInput,
      submit: handleSearch,
      clear: clearSearch,
    },
  };
}

export type UsersController = ReturnType<typeof useUsersController>;
