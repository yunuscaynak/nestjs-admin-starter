"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
  LIMIT_OPTIONS,
  POST_SORT_OPTIONS,
  USER_SORT_OPTIONS,
} from "../lib/constants";
import { getErrorMessage } from "../lib/helpers";
import type {
  PostRecord,
  PostsResponse,
  PostSortOption,
  Role,
  UserRecord,
  UsersResponse,
  UserSortOption,
} from "../lib/types";

type AuthorizedFetch = (input: string, init?: RequestInit) => Promise<Response>;

export function useAdminController({
  isAdmin,
  sessionToken,
  authorizedFetch,
}: {
  isAdmin: boolean;
  sessionToken: string | null;
  authorizedFetch: AuthorizedFetch;
}) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [authorOptions, setAuthorOptions] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [usersError, setUsersError] = useState("");
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
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isUserFilterDrawerOpen, setIsUserFilterDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRole, setEditRole] = useState<Role>("USER");
  const [totalUsers, setTotalUsers] = useState(0);

  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [hasNextPostPage, setHasNextPostPage] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postAuthorId, setPostAuthorId] = useState("");
  const [postPublished, setPostPublished] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [postLimit, setPostLimit] = useState<number>(20);
  const [postSort, setPostSort] = useState<PostSortOption>("createdAt:desc");
  const [postSearchInput, setPostSearchInput] = useState("");
  const [appliedPostQuery, setAppliedPostQuery] = useState("");
  const [postPublishedFilter, setPostPublishedFilter] = useState<
    "all" | "true" | "false"
  >("all");
  const [postAuthorFilter, setPostAuthorFilter] = useState("all");
  const [isPostDrawerOpen, setIsPostDrawerOpen] = useState(false);
  const [isPostFilterDrawerOpen, setIsPostFilterDrawerOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostPublished, setEditPostPublished] = useState(false);
  const [editPostAuthorId, setEditPostAuthorId] = useState("");
  const [totalPosts, setTotalPosts] = useState(0);
  const [activeAdminTab, setActiveAdminTab] = useState<"users" | "posts">(
    "users",
  );

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
    });

    if (appliedQuery) {
      params.set("q", appliedQuery);
    }

    return `${API_BASE_URL}/users?${params.toString()}`;
  }, [appliedQuery, limit, page, sort]);

  const postsListUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(postPage),
      limit: String(postLimit),
      sort: postSort,
    });

    if (appliedPostQuery) {
      params.set("q", appliedPostQuery);
    }

    if (postAuthorFilter !== "all") {
      params.set("authorId", postAuthorFilter);
    }

    if (postPublishedFilter !== "all") {
      params.set("published", postPublishedFilter);
    }

    return `${API_BASE_URL}/posts?${params.toString()}`;
  }, [
    appliedPostQuery,
    postAuthorFilter,
    postLimit,
    postPage,
    postPublishedFilter,
    postSort,
  ]);

  const loadUsers = useCallback(async () => {
    if (!sessionToken || !isAdmin) {
      return;
    }

    setIsLoadingUsers(true);
    setUsersError("");

    try {
      const response = await authorizedFetch(listUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = (await response.json()) as UsersResponse;

      if (data.items.length === 0 && page > 1) {
        setPage((previousPage) => Math.max(1, previousPage - 1));
        return;
      }

      setUsers(data.items);
      setTotalUsers(data.meta.total);
      setHasNextPage(page < data.meta.totalPages);
    } catch (requestError) {
      setUsersError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanicilar alinamadi.",
      );
      setUsers([]);
      setTotalUsers(0);
      setHasNextPage(false);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [authorizedFetch, isAdmin, listUrl, page, sessionToken]);

  const loadAuthorOptions = useCallback(async () => {
    if (!sessionToken || !isAdmin) {
      return;
    }

    try {
      const response = await authorizedFetch(
        `${API_BASE_URL}/users?page=1&limit=100&sort=firstName:asc`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = (await response.json()) as UsersResponse;
      setAuthorOptions(data.items);
      setPostAuthorId((current) => current || data.items[0]?.id || "");
    } catch {
      setAuthorOptions([]);
      setPostAuthorId("");
    }
  }, [authorizedFetch, isAdmin, sessionToken]);

  const loadPosts = useCallback(async () => {
    if (!sessionToken || !isAdmin) {
      return;
    }

    setIsLoadingPosts(true);
    setPostsError("");

    try {
      const response = await authorizedFetch(postsListUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = (await response.json()) as PostsResponse;

      if (data.items.length === 0 && postPage > 1) {
        setPostPage((previousPage) => Math.max(1, previousPage - 1));
        return;
      }

      setPosts(data.items);
      setTotalPosts(data.meta.total);
      setHasNextPostPage(postPage < data.meta.totalPages);
    } catch (requestError) {
      setPostsError(
        requestError instanceof Error
          ? requestError.message
          : "Postlar alinamadi.",
      );
      setPosts([]);
      setTotalPosts(0);
      setHasNextPostPage(false);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [authorizedFetch, isAdmin, postPage, postsListUrl, sessionToken]);

  useEffect(() => {
    if (isAdmin) {
      void loadUsers();
      void loadAuthorOptions();
      void loadPosts();
    }
  }, [isAdmin, loadAuthorOptions, loadPosts, loadUsers]);

  function resetUserCreateForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setShowCreatePassword(false);
    setRole("USER");
  }

  function resetUserEditForm() {
    setEditingId(null);
    setEditFirstName("");
    setEditLastName("");
    setEditEmail("");
    setEditPassword("");
    setShowEditPassword(false);
    setEditRole("USER");
  }

  function resetPostCreateForm() {
    setPostTitle("");
    setPostContent("");
    setPostPublished(false);
    setPostAuthorId((current) => current || authorOptions[0]?.id || "");
  }

  function resetPostEditForm() {
    setEditingPostId(null);
    setEditPostTitle("");
    setEditPostContent("");
    setEditPostPublished(false);
    setEditPostAuthorId("");
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionToken) {
      return;
    }

    setUsersError("");

    try {
      const response = await authorizedFetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      resetUserCreateForm();
      setIsUserDrawerOpen(false);
      await loadUsers();
      await loadAuthorOptions();
    } catch (requestError) {
      setUsersError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanici olusturulamadi.",
      );
    }
  }

  function openCreateUserDrawer() {
    resetUserEditForm();
    resetUserCreateForm();
    setIsUserDrawerOpen(true);
  }

  function closeUserDrawer() {
    setIsUserDrawerOpen(false);
    resetUserEditForm();
  }

  function beginEditUser(user: UserRecord) {
    setEditingId(user.id);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditEmail(user.email);
    setEditPassword("");
    setShowEditPassword(false);
    setEditRole(user.role);
    setIsUserDrawerOpen(true);
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedQuery(searchInput.trim());
    setPage(1);
    setIsUserFilterDrawerOpen(false);
  }

  function clearSearch() {
    setSearchInput("");
    setAppliedQuery("");
    setPage(1);
    setIsUserFilterDrawerOpen(false);
  }

  async function handleUpdateUser(id: string) {
    if (!sessionToken) {
      return;
    }

    setUsersError("");

    try {
      const response = await authorizedFetch(`${API_BASE_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          role: editRole,
          ...(editPassword.trim() ? { password: editPassword } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      closeUserDrawer();
      await loadUsers();
    } catch (requestError) {
      setUsersError(
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

    setUsersError("");

    try {
      const response = await authorizedFetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      await loadUsers();
    } catch (requestError) {
      setUsersError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanici silinemedi.",
      );
    }
  }

  async function handleCreatePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionToken) {
      return;
    }

    setPostsError("");

    try {
      const response = await authorizedFetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          authorId: postAuthorId,
          published: postPublished,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      resetPostCreateForm();
      setIsPostDrawerOpen(false);
      await loadPosts();
    } catch (requestError) {
      setPostsError(
        requestError instanceof Error
          ? requestError.message
          : "Post olusturulamadi.",
      );
    }
  }

  function openCreatePostDrawer() {
    resetPostEditForm();
    resetPostCreateForm();
    setIsPostDrawerOpen(true);
  }

  function closePostDrawer() {
    setIsPostDrawerOpen(false);
    resetPostEditForm();
  }

  function beginEditPost(post: PostRecord) {
    setEditingPostId(post.id);
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
    setEditPostPublished(post.published);
    setEditPostAuthorId(post.author.id);
    setIsPostDrawerOpen(true);
  }

  function handlePostSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedPostQuery(postSearchInput.trim());
    setPostPage(1);
    setIsPostFilterDrawerOpen(false);
  }

  function clearPostSearch() {
    setPostSearchInput("");
    setAppliedPostQuery("");
    setPostPublishedFilter("all");
    setPostAuthorFilter("all");
    setPostPage(1);
    setIsPostFilterDrawerOpen(false);
  }

  async function handleUpdatePost(id: string) {
    if (!sessionToken) {
      return;
    }

    setPostsError("");

    try {
      const response = await authorizedFetch(`${API_BASE_URL}/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editPostTitle,
          content: editPostContent,
          published: editPostPublished,
          authorId: editPostAuthorId,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      closePostDrawer();
      await loadPosts();
    } catch (requestError) {
      setPostsError(
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

    setPostsError("");

    try {
      const response = await authorizedFetch(`${API_BASE_URL}/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      await loadPosts();
    } catch (requestError) {
      setPostsError(
        requestError instanceof Error
          ? requestError.message
          : "Post silinemedi.",
      );
    }
  }

  const clearUsersDisabled =
    isLoadingUsers ||
    (searchInput.trim().length === 0 && appliedQuery.length === 0);

  const clearPostsDisabled =
    isLoadingPosts &&
    postSearchInput.trim().length === 0 &&
    appliedPostQuery.length === 0 &&
    postPublishedFilter === "all" &&
    postAuthorFilter === "all";

  return {
    constants: {
      limitOptions: LIMIT_OPTIONS,
      userSortOptions: USER_SORT_OPTIONS,
      postSortOptions: POST_SORT_OPTIONS,
    },
    activeAdminTab,
    setActiveAdminTab,
    users: {
      items: users,
      error: usersError,
      loading: isLoadingUsers,
      total: totalUsers,
      page,
      hasNextPage,
      limit,
      sort,
      appliedQuery,
      clearDisabled: clearUsersDisabled,
      drawerOpen: isUserDrawerOpen,
      filterDrawerOpen: isUserFilterDrawerOpen,
      isEditing: editingId !== null,
      editingId,
      openDrawer: openCreateUserDrawer,
      closeDrawer: closeUserDrawer,
      beginEdit: beginEditUser,
      openFilterDrawer: () => setIsUserFilterDrawerOpen(true),
      closeFilterDrawer: () => setIsUserFilterDrawerOpen(false),
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
    },
    posts: {
      items: posts,
      error: postsError,
      loading: isLoadingPosts,
      total: totalPosts,
      page: postPage,
      hasNextPage: hasNextPostPage,
      limit: postLimit,
      sort: postSort,
      appliedQuery: appliedPostQuery,
      publishedFilter: postPublishedFilter,
      authorFilter: postAuthorFilter,
      clearDisabled: clearPostsDisabled,
      drawerOpen: isPostDrawerOpen,
      filterDrawerOpen: isPostFilterDrawerOpen,
      isEditing: editingPostId !== null,
      editingId: editingPostId,
      openDrawer: openCreatePostDrawer,
      closeDrawer: closePostDrawer,
      beginEdit: beginEditPost,
      openFilterDrawer: () => setIsPostFilterDrawerOpen(true),
      closeFilterDrawer: () => setIsPostFilterDrawerOpen(false),
      setPage: setPostPage,
      setLimit: (value: number) => {
        setPostLimit(value);
        setPostPage(1);
      },
      setSort: (value: PostSortOption) => {
        setPostSort(value);
        setPostPage(1);
      },
      setPublishedFilter: (value: "all" | "true" | "false") => {
        setPostPublishedFilter(value);
        setPostPage(1);
      },
      setAuthorFilter: (value: string) => {
        setPostAuthorFilter(value);
        setPostPage(1);
      },
      deletePost: handleDeletePost,
      form: {
        title: postTitle,
        content: postContent,
        authorId: postAuthorId,
        published: postPublished,
        setTitle: setPostTitle,
        setContent: setPostContent,
        setAuthorId: setPostAuthorId,
        setPublished: setPostPublished,
        submit: handleCreatePost,
      },
      editForm: {
        title: editPostTitle,
        content: editPostContent,
        authorId: editPostAuthorId,
        published: editPostPublished,
        setTitle: setEditPostTitle,
        setContent: setEditPostContent,
        setAuthorId: setEditPostAuthorId,
        setPublished: setEditPostPublished,
        submit: handleUpdatePost,
      },
      filters: {
        searchInput: postSearchInput,
        setSearchInput: setPostSearchInput,
        submit: handlePostSearch,
        clear: clearPostSearch,
      },
    },
    authorOptions,
  };
}

export type AdminController = ReturnType<typeof useAdminController>;
