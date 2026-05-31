"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { HttpClient } from "@/features/shared/services/http-client";
import type { PostRecord } from "@/features/posts/types";
import type { UserRecord } from "@/features/users/types";
import {
  createPost,
  deletePost,
  listPosts,
  updatePost,
} from "../services/post-service";
import { usePostFilters } from "./use-post-filters";
import { usePostFormState } from "./use-post-form-state";

export function usePostsController({
  isAdmin,
  sessionToken,
  apiClient,
  authorOptions,
}: {
  isAdmin: boolean;
  sessionToken: string | null;
  apiClient: HttpClient;
  authorOptions: UserRecord[];
}) {
  const [items, setItems] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<"all" | "true" | "false">(
    "all",
  );
  const [authorFilter, setAuthorFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const filters = usePostFilters();
  const formState = usePostFormState(authorOptions);
  const { page, setPage, limit, sort, filterDrawerOpen, listQuery: baseListQuery } =
    filters;
  const { createForm, editForm, editingId, setCreateAuthorId } = formState;

  const listQuery = useMemo(
    () => ({
      ...baseListQuery,
      authorId: authorFilter !== "all" ? authorFilter : undefined,
      published: publishedFilter !== "all" ? publishedFilter : undefined,
    }),
    [authorFilter, baseListQuery, publishedFilter],
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
  }, [apiClient, isAdmin, listQuery, page, sessionToken, setPage]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    queueMicrotask(() => {
      void loadPosts();
    });
  }, [isAdmin, loadPosts]);

  useEffect(() => {
    if (!createForm.authorId && authorOptions.length > 0) {
      setCreateAuthorId(authorOptions[0].id);
    }
  }, [authorOptions, createForm.authorId, setCreateAuthorId]);

  async function handleCreatePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await createPost(apiClient, {
        title: createForm.title,
        content: createForm.content,
        authorId: createForm.authorId,
        published: createForm.published,
      });

      formState.resetCreateForm();
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
    formState.resetEditForm();
    formState.resetCreateForm();
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    formState.resetEditForm();
  }

  async function handleUpdatePost(id: string) {
    if (!sessionToken) {
      return;
    }

    setError("");

    try {
      await updatePost(apiClient, id, {
        title: editForm.title,
        content: editForm.content,
        published: editForm.published,
        authorId: editForm.authorId,
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

  async function handleTogglePublish(post: PostRecord) {
    if (!sessionToken) {
      return;
    }

    setError("");
    setPublishingId(post.id);

    try {
      await updatePost(apiClient, post.id, {
        title: post.title,
        content: post.content,
        authorId: post.author.id,
        published: !post.published,
      });

      await loadPosts();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Post yayin durumu guncellenemedi.",
      );
    } finally {
      setPublishingId(null);
    }
  }

  const clearDisabled =
    loading &&
    filters.filters.searchInput.trim().length === 0 &&
    filters.filters.appliedQuery.length === 0 &&
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
    appliedQuery: filters.filters.appliedQuery,
    publishedFilter,
    authorFilter,
    clearDisabled,
    drawerOpen,
    publishingId,
    filterDrawerOpen,
    isEditing: editingId !== null,
    editingId,
    openDrawer,
    closeDrawer,
    beginEdit: (post: PostRecord) => {
      formState.beginEdit(post);
      setDrawerOpen(true);
    },
    openFilterDrawer: filters.openFilterDrawer,
    closeFilterDrawer: filters.closeFilterDrawer,
    setPage: filters.setPage,
    setLimit: filters.setLimit,
    setSort: filters.setSort,
    setPublishedFilter: (value: "all" | "true" | "false") => {
      setPublishedFilter(value);
      filters.setPage(1);
    },
    setAuthorFilter: (value: string) => {
      setAuthorFilter(value);
      filters.setPage(1);
    },
    deletePost: handleDeletePost,
    togglePublish: handleTogglePublish,
    form: {
      ...formState.createForm,
      setTitle: formState.setCreateTitle,
      setContent: formState.setCreateContent,
      setAuthorId: formState.setCreateAuthorId,
      setPublished: formState.setCreatePublished,
      submit: handleCreatePost,
    },
    editForm: {
      ...formState.editForm,
      setTitle: formState.setEditTitle,
      setContent: formState.setEditContent,
      setAuthorId: formState.setEditAuthorId,
      setPublished: formState.setEditPublished,
      submit: handleUpdatePost,
    },
    filters: {
      searchInput: filters.filters.searchInput,
      setSearchInput: filters.setSearchInput,
      submit: (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        filters.applyFilters();
      },
      clear: () => {
        filters.clearFilters();
        setPublishedFilter("all");
        setAuthorFilter("all");
      },
    },
  };
}

export type PostsController = ReturnType<typeof usePostsController>;
