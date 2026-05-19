"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiClient } from "@/features/shared/services/api-client";
import type {
  PostRecord,
  PostSortOption,
  UserRecord,
} from "@/features/shared/lib/types";
import {
  createPost,
  deletePost,
  listPosts,
  updatePost,
} from "../services/api";

export function usePostsController({
  isAdmin,
  sessionToken,
  apiClient,
  authorOptions,
}: {
  isAdmin: boolean;
  sessionToken: string | null;
  apiClient: ApiClient;
  authorOptions: UserRecord[];
}) {
  const [items, setItems] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [published, setPublished] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(20);
  const [sort, setSort] = useState<PostSortOption>("createdAt:desc");
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<"all" | "true" | "false">(
    "all",
  );
  const [authorFilter, setAuthorFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPublished, setEditPublished] = useState(false);
  const [editAuthorId, setEditAuthorId] = useState("");
  const [total, setTotal] = useState(0);

  const listQuery = useMemo(
    () => ({
      page,
      limit,
      sort,
      q: appliedQuery || undefined,
      authorId: authorFilter !== "all" ? authorFilter : undefined,
      published: publishedFilter !== "all" ? publishedFilter : undefined,
    }),
    [appliedQuery, authorFilter, limit, page, publishedFilter, sort],
  );

  const loadPosts = useCallback(async () => {
    if (!sessionToken || !isAdmin) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await listPosts(apiClient, listQuery);

      if (data.items.length === 0 && page > 1) {
        setPage((previousPage) => Math.max(1, previousPage - 1));
        return;
      }

      setItems(data.items);
      setTotal(data.meta.total);
      setHasNextPage(page < data.meta.totalPages);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Postlar alinamadi.",
      );
      setItems([]);
      setTotal(0);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [apiClient, isAdmin, listQuery, page, sessionToken]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    void loadPosts();
  }, [isAdmin, loadPosts]);

  useEffect(() => {
    if (!authorId && authorOptions.length > 0) {
      setAuthorId(authorOptions[0].id);
    }
  }, [authorId, authorOptions]);

  function resetCreateForm() {
    setTitle("");
    setContent("");
    setPublished(false);
    setAuthorId((current) => current || authorOptions[0]?.id || "");
  }

  function resetEditForm() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditPublished(false);
    setEditAuthorId("");
  }

  async function handleCreatePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await createPost(apiClient, {
        title,
        content,
        authorId,
        published,
      });

      resetCreateForm();
      setDrawerOpen(false);
      await loadPosts();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Post olusturulamadi.",
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

  function beginEdit(post: PostRecord) {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditPublished(post.published);
    setEditAuthorId(post.author.id);
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
    setPublishedFilter("all");
    setAuthorFilter("all");
    setPage(1);
    setFilterDrawerOpen(false);
  }

  async function handleUpdatePost(id: string) {
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await updatePost(apiClient, id, {
        title: editTitle,
        content: editContent,
        published: editPublished,
        authorId: editAuthorId,
      });

      closeDrawer();
      await loadPosts();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Post guncellenemedi.",
      );
    }
  }

  async function handleDeletePost(id: string) {
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await deletePost(apiClient, id);
      await loadPosts();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Post silinemedi.",
      );
    }
  }

  const clearDisabled =
    loading &&
    searchInput.trim().length === 0 &&
    appliedQuery.length === 0 &&
    publishedFilter === "all" &&
    authorFilter === "all";

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
    publishedFilter,
    authorFilter,
    clearDisabled,
    drawerOpen,
    filterDrawerOpen,
    isEditing: editingId !== null,
    editingId,
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
    setSort: (value: PostSortOption) => {
      setSort(value);
      setPage(1);
    },
    setPublishedFilter: (value: "all" | "true" | "false") => {
      setPublishedFilter(value);
      setPage(1);
    },
    setAuthorFilter: (value: string) => {
      setAuthorFilter(value);
      setPage(1);
    },
    deletePost: handleDeletePost,
    form: {
      title,
      content,
      authorId,
      published,
      setTitle,
      setContent,
      setAuthorId,
      setPublished,
      submit: handleCreatePost,
    },
    editForm: {
      title: editTitle,
      content: editContent,
      authorId: editAuthorId,
      published: editPublished,
      setTitle: setEditTitle,
      setContent: setEditContent,
      setAuthorId: setEditAuthorId,
      setPublished: setEditPublished,
      submit: handleUpdatePost,
    },
    filters: {
      searchInput,
      setSearchInput,
      submit: handleSearch,
      clear: clearSearch,
    },
  };
}

export type PostsController = ReturnType<typeof usePostsController>;
