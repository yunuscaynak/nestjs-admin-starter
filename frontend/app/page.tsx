"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faArrowRightFromBracket,
  faBan,
  faEye,
  faEyeSlash,
  faFileLines,
  faFloppyDisk,
  faMagnifyingGlass,
  faPen,
  faPlus,
  faSliders,
  faTrash,
  faUserPlus,
  faUsers,
  faRightToBracket,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Role = "ADMIN" | "USER";

type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = {
  items: UserRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type PostRecord = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

type PostsResponse = {
  items: PostRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rememberMe: boolean;
  role: Role;
  user: UserRecord;
};

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rememberMe: boolean;
};

type ApiError = {
  message?: string | string[];
};

type UserSortOption =
  | "id:asc"
  | "id:desc"
  | "firstName:asc"
  | "firstName:desc"
  | "email:asc"
  | "email:desc"
  | "createdAt:asc"
  | "createdAt:desc"
  | "updatedAt:asc"
  | "updatedAt:desc";

type PostSortOption =
  | "title:asc"
  | "title:desc"
  | "createdAt:asc"
  | "createdAt:desc"
  | "updatedAt:asc"
  | "updatedAt:desc";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002/api";
const SESSION_STORAGE_KEY = "nest-crud-session";
const LIMIT_OPTIONS = [10, 20, 50, 100] as const;
const SORT_OPTIONS: Array<{ label: string; value: UserSortOption }> = [
  { label: "En yeni", value: "createdAt:desc" },
  { label: "En eski", value: "createdAt:asc" },
  { label: "Ad (A-Z)", value: "firstName:asc" },
  { label: "Ad (Z-A)", value: "firstName:desc" },
  { label: "E-posta (A-Z)", value: "email:asc" },
  { label: "E-posta (Z-A)", value: "email:desc" },
];
const POST_SORT_OPTIONS: Array<{ label: string; value: PostSortOption }> = [
  { label: "En yeni", value: "createdAt:desc" },
  { label: "En eski", value: "createdAt:asc" },
  { label: "Baslik (A-Z)", value: "title:asc" },
  { label: "Baslik (Z-A)", value: "title:desc" },
  { label: "Son guncellenen", value: "updatedAt:desc" },
];

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as ApiError;
    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // Response body bos veya JSON degilse default mesaja dus.
  }

  return "Bilinmeyen bir hata olustu.";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("tr-TR");
}

function getFullName(user: UserRecord) {
  return `${user.firstName} ${user.lastName}`;
}

function getAuthorName(post: PostRecord) {
  return `${post.author.firstName} ${post.author.lastName}`;
}

function getStorage(rememberMe: boolean) {
  return rememberMe ? window.localStorage : window.sessionStorage;
}

function readStoredSession(): StoredSession | null {
  const raw =
    window.localStorage.getItem(SESSION_STORAGE_KEY) ??
    window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function ButtonLabel({
  icon,
  children,
}: {
  icon: typeof faPlus;
  children: ReactNode;
}) {
  return (
    <span className="button-label">
      <FontAwesomeIcon icon={icon} className="button-icon" />
      <span>{children}</span>
    </span>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  required?: boolean;
}) {
  return (
    <div className="password-field">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={visible ? "text" : "password"}
        minLength={8}
        required={required}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={onToggle}
        aria-label={visible ? "Sifreyi gizle" : "Sifreyi goster"}
      >
        <FontAwesomeIcon
          icon={visible ? faEyeSlash : faEye}
          className="password-toggle-icon"
        />
      </button>
    </div>
  );
}

export default function Home() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authFirstName, setAuthFirstName] = useState("");
  const [authLastName, setAuthLastName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authRememberMe, setAuthRememberMe] = useState(true);
  const [showAuthPassword, setShowAuthPassword] = useState(false);

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

  const isAdmin = currentUser?.role === "ADMIN";

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

  const persistSession = useCallback((payload: AuthResponse) => {
    const session: StoredSession = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
      rememberMe: payload.rememberMe,
    };

    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    getStorage(payload.rememberMe).setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );

    setSessionToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
    setCurrentUser(payload.user);
  }, []);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    setUsers([]);
    setAuthorOptions([]);
    setTotalUsers(0);
    setUsersError("");
    setEditingId(null);
    setIsUserFilterDrawerOpen(false);
    setPosts([]);
    setTotalPosts(0);
    setPostsError("");
    setIsPostDrawerOpen(false);
    setIsPostFilterDrawerOpen(false);
    setEditingPostId(null);
  }, []);

  const fetchMe = useCallback(
    async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const user = (await response.json()) as UserRecord;
      setCurrentUser(user);
      setSessionToken(token);
    },
    [],
  );

  const refreshSession = useCallback(
    async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: token }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = (await response.json()) as AuthResponse;
      persistSession(data);

      return data;
    },
    [persistSession],
  );

  useEffect(() => {
    const storedSession = readStoredSession();

    if (!storedSession) {
      setAuthLoading(false);
      return;
    }

    void fetchMe(storedSession.accessToken)
      .catch(async () => {
        try {
          const refreshedSession = await refreshSession(
            storedSession.refreshToken,
          );
          await fetchMe(refreshedSession.accessToken);
        } catch {
          clearSession();
        }
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [clearSession, fetchMe, refreshSession]);

  const authorizedFetch = useCallback(
    async (input: string, init?: RequestInit): Promise<Response> => {
      if (!sessionToken) {
        throw new Error("Oturum bulunamadi.");
      }

      const requestInit: RequestInit = {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${sessionToken}`,
        },
      };

      let response = await fetch(input, requestInit);

      if (response.status !== 401 || !refreshToken) {
        return response;
      }

      try {
        const refreshedSession = await refreshSession(refreshToken);
        response = await fetch(input, {
          ...init,
          headers: {
            ...(init?.headers ?? {}),
            Authorization: `Bearer ${refreshedSession.accessToken}`,
          },
        });
        return response;
      } catch {
        clearSession();
        throw new Error("Oturum suresi doldu. Tekrar giris yapin.");
      }
    },
    [clearSession, refreshSession, refreshToken, sessionToken],
  );

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
    if (!authLoading && isAdmin) {
      void loadUsers();
      void loadAuthorOptions();
      void loadPosts();
    }
  }, [authLoading, isAdmin, loadAuthorOptions, loadPosts, loadUsers]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError("");

    try {
      const endpoint =
        authMode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        authMode === "login"
          ? { email: authEmail, password: authPassword }
          : {
              firstName: authFirstName,
              lastName: authLastName,
              email: authEmail,
              password: authPassword,
              rememberMe: authRememberMe,
            };
      const requestPayload =
        authMode === "login"
          ? {
              email: authEmail,
              password: authPassword,
              rememberMe: authRememberMe,
            }
          : payload;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = (await response.json()) as AuthResponse;
      persistSession(data);
      setAuthPassword("");
      setShowAuthPassword(false);
    } catch (requestError) {
      setAuthError(
        requestError instanceof Error
          ? requestError.message
          : "Kimlik dogrulama tamamlanamadi.",
      );
    } finally {
      setIsSubmittingAuth(false);
      setAuthLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
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

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setShowCreatePassword(false);
      setRole("USER");
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
    setEditingId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setShowCreatePassword(false);
    setRole("USER");
    setIsUserDrawerOpen(true);
  }

  function closeUserDrawer() {
    setIsUserDrawerOpen(false);
    setEditingId(null);
    setEditFirstName("");
    setEditLastName("");
    setEditEmail("");
    setEditPassword("");
    setShowEditPassword(false);
    setEditRole("USER");
  }

  function beginEdit(user: UserRecord) {
    setEditingId(user.id);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditEmail(user.email);
    setEditPassword("");
    setShowEditPassword(false);
    setEditRole(user.role);
    setIsUserDrawerOpen(true);
  }

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
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

      setPostTitle("");
      setPostContent("");
      setPostPublished(false);
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
    setEditingPostId(null);
    setPostTitle("");
    setPostContent("");
    setPostPublished(false);
    setPostAuthorId((current) => current || authorOptions[0]?.id || "");
    setIsPostDrawerOpen(true);
  }

  function closePostDrawer() {
    setIsPostDrawerOpen(false);
    setEditingPostId(null);
    setEditPostTitle("");
    setEditPostContent("");
    setEditPostPublished(false);
    setEditPostAuthorId("");
  }

  function beginEditPost(post: PostRecord) {
    setEditingPostId(post.id);
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
    setEditPostPublished(post.published);
    setEditPostAuthorId(post.author.id);
    setIsPostDrawerOpen(true);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
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

  function handlePostSearch(event: FormEvent<HTMLFormElement>) {
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

  async function handleUpdate(id: string) {
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

  async function handleDelete(id: string) {
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

  const clearDisabled =
    isLoadingUsers ||
    (searchInput.trim().length === 0 && appliedQuery.length === 0);
  const clearPostsDisabled =
    isLoadingPosts &&
    postSearchInput.trim().length === 0 &&
    appliedPostQuery.length === 0 &&
    postPublishedFilter === "all" &&
    postAuthorFilter === "all";
  const isEditingUser = editingId !== null;
  const isEditingPost = editingPostId !== null;

  async function handleLogout() {
    const currentRefreshToken = refreshToken;

    clearSession();

    if (!currentRefreshToken) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });
    } catch {
      // Cikis UX'ini bloklamamak icin hata yutulur.
    }
  }

  if (authLoading) {
    return (
      <main className="page auth-page">
        <section className="shell">
          <article className="card auth-card">
            <p className="eyebrow">Yukleniyor</p>
            <h1>Oturum kontrol ediliyor</h1>
          </article>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="page auth-page">
        <section className="shell auth-shell">
          <article className="hero-panel">
            <p className="eyebrow">Nest CRUD</p>
            <h1>JWT ile korunan kullanici yonetimi</h1>
            <p className="hero-copy">
              Ilk kayit olan hesap otomatik olarak <strong>admin</strong> olur.
              Admin girisi sonrasinda tum `users` islemleri korunur.
            </p>
            <div className="hero-points">
              <span className="chip">Register/Login endpoint</span>
              <span className="chip">JWT guard</span>
              <span className="chip">Role tabanli yetki</span>
            </div>
          </article>

          <article className="card auth-card">
            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "tab active" : "tab"}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
              >
                <ButtonLabel icon={faRightToBracket}>Giris Yap</ButtonLabel>
              </button>
              <button
                type="button"
                className={authMode === "register" ? "tab active" : "tab"}
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
              >
                <ButtonLabel icon={faUserPlus}>Kayit Ol</ButtonLabel>
              </button>
            </div>

            <form onSubmit={submitAuth} className="auth-form">
              {authMode === "register" ? (
                <>
                  <input
                    value={authFirstName}
                    onChange={(event) => setAuthFirstName(event.target.value)}
                    placeholder="Ad"
                    required
                  />
                  <input
                    value={authLastName}
                    onChange={(event) => setAuthLastName(event.target.value)}
                    placeholder="Soyad"
                    required
                  />
                </>
              ) : null}

              <input
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                placeholder="E-posta"
                type="email"
                required
              />
              <PasswordField
                value={authPassword}
                onChange={setAuthPassword}
                placeholder="Sifre"
                visible={showAuthPassword}
                onToggle={() => setShowAuthPassword((current) => !current)}
                required
              />
              <label className="checkbox-field">
                <input
                  checked={authRememberMe}
                  onChange={(event) => setAuthRememberMe(event.target.checked)}
                  type="checkbox"
                />
                <span>Beni hatirla</span>
              </label>

              <button type="submit" disabled={isSubmittingAuth}>
                {isSubmittingAuth
                  ? "Bekleyin..."
                  : authMode === "login"
                    ? <ButtonLabel icon={faRightToBracket}>Giris Yap</ButtonLabel>
                    : <ButtonLabel icon={faUserPlus}>Hesap Olustur</ButtonLabel>}
              </button>
            </form>

            {authError ? <p className="error">{authError}</p> : null}
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="page dashboard-page">
      <section className="shell dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Aktif Oturum</p>
            <h1>{getFullName(currentUser)}</h1>
            <p className="header-copy">
              {currentUser.email} · Rol: <strong>{currentUser.role}</strong>
            </p>
          </div>
          <button type="button" className="ghost" onClick={() => void handleLogout()}>
            <ButtonLabel icon={faArrowRightFromBracket}>Cikis Yap</ButtonLabel>
          </button>
        </header>

        {!isAdmin ? (
          <section className="card">
            <h2>Yetki siniri</h2>
            <p className="empty-state">
              Bu hesap giris yapti ancak `users` endpointleri sadece admin
              kullanicilar icin acik.
            </p>
          </section>
        ) : (
          <>
            <section className="card management-hub">
              <div className="management-tabs">
                <button
                  type="button"
                  className={
                    activeAdminTab === "users"
                      ? "management-tab active"
                      : "management-tab"
                  }
                  onClick={() => setActiveAdminTab("users")}
                >
                  <ButtonLabel icon={faUsers}>Kullanicilar</ButtonLabel>
                </button>
                <button
                  type="button"
                  className={
                    activeAdminTab === "posts"
                      ? "management-tab active"
                      : "management-tab"
                  }
                  onClick={() => setActiveAdminTab("posts")}
                >
                  <ButtonLabel icon={faFileLines}>Postlar</ButtonLabel>
                </button>
              </div>

              {activeAdminTab === "users" ? (
                <div className="tab-stack">
                  <section className="card list-card inset-card">
                    <div className="panel-header">
                      <div>
                        <p className="eyebrow">User</p>
                        <h2 className="section-title">Kullanici Yonetimi</h2>
                      </div>
                      <div className="panel-actions">
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => setIsUserFilterDrawerOpen(true)}
                        >
                          <ButtonLabel icon={faSliders}>Filtreler</ButtonLabel>
                        </button>
                        <button
                          type="button"
                          onClick={openCreateUserDrawer}
                          disabled={isLoadingUsers}
                        >
                          <ButtonLabel icon={faPlus}>Yeni Kullanici</ButtonLabel>
                        </button>
                      </div>
                    </div>

                    {usersError ? <p className="error">{usersError}</p> : null}

                    <div className="list-wrapper">
                      {!isLoadingUsers && users.length === 0 ? (
                        <p className="empty-state">
                          Bu filtrelere uygun kullanici yok.
                        </p>
                      ) : null}
                      {users.map((user) => (
                        <article key={user.id} className="user-card">
                          <div className="user-row">
                            <div className="user-main">
                              <h3>{getFullName(user)}</h3>
                              <p>{user.email}</p>
                            </div>
                            <div className="user-meta">
                              <span className="chip role-chip">{user.role}</span>
                              <span>#{user.id.slice(0, 8)}</span>
                              <time>{formatDate(user.createdAt)}</time>
                            </div>
                          </div>
                          <div className="actions">
                            <button
                              type="button"
                              onClick={() => beginEdit(user)}
                            >
                              <ButtonLabel icon={faPen}>Duzenle</ButtonLabel>
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => void handleDelete(user.id)}
                            >
                              <ButtonLabel icon={faTrash}>Sil</ButtonLabel>
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="list-meta">
                      <div className="list-meta-left">
                        <strong>
                          {isLoadingUsers ? "Yukleniyor..." : `${totalUsers} kayit`}
                        </strong>
                        <span className="chip">
                          Siralama:{" "}
                          {SORT_OPTIONS.find((option) => option.value === sort)?.label ??
                            sort}
                        </span>
                        <span className="chip">{limit} / sayfa</span>
                        {appliedQuery ? (
                          <span className="chip">Arama: {appliedQuery}</span>
                        ) : null}
                      </div>
                      <div className="pagination">
                        <button
                          type="button"
                          className="ghost"
                          onClick={() =>
                            setPage((previousPage) => Math.max(1, previousPage - 1))
                          }
                          disabled={isLoadingUsers || page === 1}
                        >
                          <ButtonLabel icon={faArrowLeft}>Onceki</ButtonLabel>
                        </button>
                        <span>Sayfa {page}</span>
                        <button
                          type="button"
                          onClick={() => setPage((previousPage) => previousPage + 1)}
                          disabled={isLoadingUsers || !hasNextPage}
                        >
                          <ButtonLabel icon={faArrowRight}>Sonraki</ButtonLabel>
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="tab-stack">
                  <section className="card list-card inset-card">
                    <div className="panel-header">
                      <div>
                        <p className="eyebrow">Posts</p>
                        <h2 className="section-title">Post Yonetimi</h2>
                      </div>
                      <div className="panel-actions">
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => setIsPostFilterDrawerOpen(true)}
                        >
                          <ButtonLabel icon={faSliders}>Filtreler</ButtonLabel>
                        </button>
                        <button
                          type="button"
                          onClick={openCreatePostDrawer}
                          disabled={isLoadingPosts || authorOptions.length === 0}
                        >
                          <ButtonLabel icon={faPlus}>Yeni Post</ButtonLabel>
                        </button>
                      </div>
                    </div>

                    {postsError ? <p className="error">{postsError}</p> : null}

                    <div className="list-wrapper">
                      {!isLoadingPosts && posts.length === 0 ? (
                        <p className="empty-state">Bu filtrelere uygun post yok.</p>
                      ) : null}
                      {posts.map((post) => (
                        <article key={post.id} className="post-card">
                          <>
                            <div className="user-row">
                              <div className="user-main">
                                <h3>{post.title}</h3>
                                <p>{post.content}</p>
                              </div>
                              <div className="user-meta">
                                <span className="chip role-chip">
                                  {post.published ? "YAYINDA" : "TASLAK"}
                                </span>
                                <span>#{post.id.slice(0, 8)}</span>
                                <time>{formatDate(post.createdAt)}</time>
                              </div>
                            </div>
                            <div className="post-footer">
                              <div className="post-author">
                                <FontAwesomeIcon
                                  icon={faFileLines}
                                  className="button-icon"
                                />
                                <span>
                                  {getAuthorName(post)} · {post.author.email}
                                </span>
                              </div>
                              <div className="actions">
                                <button
                                  type="button"
                                  onClick={() => beginEditPost(post)}
                                >
                                  <ButtonLabel icon={faPen}>Duzenle</ButtonLabel>
                                </button>
                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() => void handleDeletePost(post.id)}
                                >
                                  <ButtonLabel icon={faTrash}>Sil</ButtonLabel>
                                </button>
                              </div>
                            </div>
                          </>
                        </article>
                      ))}
                    </div>

                    <div className="list-meta">
                      <div className="list-meta-left">
                        <strong>
                          {isLoadingPosts ? "Yukleniyor..." : `${totalPosts} post`}
                        </strong>
                        <span className="chip">
                          Siralama:{" "}
                          {POST_SORT_OPTIONS.find((option) => option.value === postSort)
                            ?.label ?? postSort}
                        </span>
                        <span className="chip">{postLimit} / sayfa</span>
                        {appliedPostQuery ? (
                          <span className="chip">Arama: {appliedPostQuery}</span>
                        ) : null}
                        {postPublishedFilter !== "all" ? (
                          <span className="chip">
                            Durum:{" "}
                            {postPublishedFilter === "true" ? "Yayinda" : "Taslak"}
                          </span>
                        ) : null}
                      </div>
                      <div className="pagination">
                        <button
                          type="button"
                          className="ghost"
                          onClick={() =>
                            setPostPage((previousPage) =>
                              Math.max(1, previousPage - 1),
                            )
                          }
                          disabled={isLoadingPosts || postPage === 1}
                        >
                          <ButtonLabel icon={faArrowLeft}>Onceki</ButtonLabel>
                        </button>
                        <span>Sayfa {postPage}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setPostPage((previousPage) => previousPage + 1)
                          }
                          disabled={isLoadingPosts || !hasNextPostPage}
                        >
                          <ButtonLabel icon={faArrowRight}>Sonraki</ButtonLabel>
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </section>
          </>
        )}
      </section>

      {isUserDrawerOpen ? (
        <div
          className="slideover-root is-open"
          role="dialog"
          aria-modal="true"
          onClick={closeUserDrawer}
        >
          <aside
            className="slideover-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="slideover-header">
              <div>
                <p className="eyebrow">
                  {isEditingUser ? "Guncelle" : "Yeni Kullanici"}
                </p>
                <h2>{isEditingUser ? "Kullanici Duzenle" : "Kullanici Ekle"}</h2>
                <p className="slideover-copy">
                  {isEditingUser
                    ? "Ad, rol ve sifre gibi alanlari ayri panelden guncelleyin."
                    : "Yeni kullanici bilgisini listeyi bozmadan sag panelden ekleyin."}
                </p>
              </div>
              <button
                type="button"
                className="ghost icon-only"
                onClick={closeUserDrawer}
                aria-label="Kapat"
              >
                <FontAwesomeIcon icon={faXmark} className="button-icon" />
              </button>
            </div>

            {usersError ? <p className="error">{usersError}</p> : null}

            {isEditingUser ? (
              <form
                className="slideover-form slideover-user-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (editingId) {
                    void handleUpdate(editingId);
                  }
                }}
              >
                <input
                  value={editFirstName}
                  onChange={(event) => setEditFirstName(event.target.value)}
                  placeholder="Ad"
                  required
                />
                <input
                  value={editLastName}
                  onChange={(event) => setEditLastName(event.target.value)}
                  placeholder="Soyad"
                  required
                />
                <input
                  value={editEmail}
                  type="email"
                  onChange={(event) => setEditEmail(event.target.value)}
                  placeholder="E-posta"
                  required
                />
                <PasswordField
                  value={editPassword}
                  onChange={setEditPassword}
                  placeholder="Yeni sifre (opsiyonel)"
                  visible={showEditPassword}
                  onToggle={() => setShowEditPassword((current) => !current)}
                />
                <select
                  value={editRole}
                  onChange={(event) => setEditRole(event.target.value as Role)}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <div className="slideover-actions">
                  <button type="submit">
                    <ButtonLabel icon={faFloppyDisk}>Kaydet</ButtonLabel>
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={closeUserDrawer}
                  >
                    <ButtonLabel icon={faBan}>Vazgec</ButtonLabel>
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleCreate}
                className="slideover-form slideover-user-form"
              >
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Ad"
                  required
                />
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Soyad"
                  required
                />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="E-posta"
                  type="email"
                  required
                />
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  placeholder="Gecici sifre"
                  visible={showCreatePassword}
                  onToggle={() => setShowCreatePassword((current) => !current)}
                  required
                />
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <div className="slideover-actions">
                  <button type="submit" disabled={isLoadingUsers}>
                    <ButtonLabel icon={faPlus}>Ekle</ButtonLabel>
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={closeUserDrawer}
                  >
                    <ButtonLabel icon={faBan}>Vazgec</ButtonLabel>
                  </button>
                </div>
              </form>
            )}
          </aside>
        </div>
      ) : null}

      {isUserFilterDrawerOpen ? (
        <div
          className="slideover-root is-open"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsUserFilterDrawerOpen(false)}
        >
          <aside
            className="slideover-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="slideover-header">
              <div>
                <p className="eyebrow">Filtreler</p>
                <h2>Kullanici Filtreleri</h2>
                <p className="slideover-copy">
                  Arama, siralama ve sayfa boyutunu bu panelden yonetin.
                </p>
              </div>
              <button
                type="button"
                className="ghost icon-only"
                onClick={() => setIsUserFilterDrawerOpen(false)}
                aria-label="Kapat"
              >
                <FontAwesomeIcon icon={faXmark} className="button-icon" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="slideover-form">
              <div className="toolbar-field">
                <span className="toolbar-label">Ara</span>
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Ad veya e-posta ara"
                />
              </div>
              <div className="toolbar-field">
                <span className="toolbar-label">Sirala</span>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as UserSortOption);
                    setPage(1);
                  }}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="toolbar-field">
                <span className="toolbar-label">Gorunum</span>
                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  {LIMIT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} / sayfa
                    </option>
                  ))}
                </select>
              </div>
              <div className="slideover-actions">
                <button type="submit" disabled={isLoadingUsers}>
                  <ButtonLabel icon={faMagnifyingGlass}>Uygula</ButtonLabel>
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={clearSearch}
                  disabled={clearDisabled}
                >
                  <ButtonLabel icon={faXmark}>Temizle</ButtonLabel>
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}

      {isPostDrawerOpen ? (
        <div
          className="slideover-root is-open"
          role="dialog"
          aria-modal="true"
          onClick={closePostDrawer}
        >
          <aside
            className="slideover-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="slideover-header">
              <div>
                <p className="eyebrow">
                  {isEditingPost ? "Guncelle" : "Yeni Post"}
                </p>
                <h2>{isEditingPost ? "Post Duzenle" : "Post Ekle"}</h2>
                <p className="slideover-copy">
                  {isEditingPost
                    ? "Baslik, yazar, durum ve icerik alanlarini ayri panelden guncelleyin."
                    : "Yeni post bilgisini liste akisini bozmadan sag panelden ekleyin."}
                </p>
              </div>
              <button
                type="button"
                className="ghost icon-only"
                onClick={closePostDrawer}
                aria-label="Kapat"
              >
                <FontAwesomeIcon icon={faXmark} className="button-icon" />
              </button>
            </div>

            {postsError ? <p className="error">{postsError}</p> : null}

            {isEditingPost ? (
              <form
                className="slideover-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (editingPostId) {
                    void handleUpdatePost(editingPostId);
                  }
                }}
              >
                <input
                  value={editPostTitle}
                  onChange={(event) => setEditPostTitle(event.target.value)}
                  placeholder="Baslik"
                  required
                />
                <select
                  value={editPostAuthorId}
                  onChange={(event) => setEditPostAuthorId(event.target.value)}
                  required
                >
                  {authorOptions.map((author) => (
                    <option key={author.id} value={author.id}>
                      {getFullName(author)} · {author.email}
                    </option>
                  ))}
                </select>
                <label className="checkbox-field">
                  <input
                    checked={editPostPublished}
                    onChange={(event) =>
                      setEditPostPublished(event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>Yayinda</span>
                </label>
                <textarea
                  value={editPostContent}
                  onChange={(event) => setEditPostContent(event.target.value)}
                  placeholder="Icerik"
                  required
                  rows={6}
                />
                <div className="slideover-actions">
                  <button type="submit">
                    <ButtonLabel icon={faFloppyDisk}>Kaydet</ButtonLabel>
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={closePostDrawer}
                  >
                    <ButtonLabel icon={faBan}>Vazgec</ButtonLabel>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreatePost} className="slideover-form">
                <input
                  value={postTitle}
                  onChange={(event) => setPostTitle(event.target.value)}
                  placeholder="Baslik"
                  required
                />
                <select
                  value={postAuthorId}
                  onChange={(event) => setPostAuthorId(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Yazar sec
                  </option>
                  {authorOptions.map((author) => (
                    <option key={author.id} value={author.id}>
                      {getFullName(author)} · {author.email}
                    </option>
                  ))}
                </select>
                <label className="checkbox-field">
                  <input
                    checked={postPublished}
                    onChange={(event) => setPostPublished(event.target.checked)}
                    type="checkbox"
                  />
                  <span>Hemen yayinla</span>
                </label>
                <textarea
                  value={postContent}
                  onChange={(event) => setPostContent(event.target.value)}
                  placeholder="Icerik"
                  required
                  rows={6}
                />
                <div className="slideover-actions">
                  <button
                    type="submit"
                    disabled={isLoadingPosts || !postAuthorId}
                  >
                    <ButtonLabel icon={faPlus}>Post Ekle</ButtonLabel>
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={closePostDrawer}
                  >
                    <ButtonLabel icon={faBan}>Vazgec</ButtonLabel>
                  </button>
                </div>
              </form>
            )}
          </aside>
        </div>
      ) : null}

      {isPostFilterDrawerOpen ? (
        <div
          className="slideover-root is-open"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsPostFilterDrawerOpen(false)}
        >
          <aside
            className="slideover-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="slideover-header">
              <div>
                <p className="eyebrow">Filtreler</p>
                <h2>Post Filtreleri</h2>
                <p className="slideover-copy">
                  Arama, durum, yazar ve siralama ayarlarini bu panelden yonetin.
                </p>
              </div>
              <button
                type="button"
                className="ghost icon-only"
                onClick={() => setIsPostFilterDrawerOpen(false)}
                aria-label="Kapat"
              >
                <FontAwesomeIcon icon={faXmark} className="button-icon" />
              </button>
            </div>

            <form onSubmit={handlePostSearch} className="slideover-form">
              <div className="toolbar-field">
                <span className="toolbar-label">Ara</span>
                <input
                  value={postSearchInput}
                  onChange={(event) => setPostSearchInput(event.target.value)}
                  placeholder="Baslik veya icerik ara"
                />
              </div>
              <div className="toolbar-field">
                <span className="toolbar-label">Sirala</span>
                <select
                  value={postSort}
                  onChange={(event) => {
                    setPostSort(event.target.value as PostSortOption);
                    setPostPage(1);
                  }}
                >
                  {POST_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="toolbar-field">
                <span className="toolbar-label">Gorunum</span>
                <select
                  value={postLimit}
                  onChange={(event) => {
                    setPostLimit(Number(event.target.value));
                    setPostPage(1);
                  }}
                >
                  {LIMIT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} / sayfa
                    </option>
                  ))}
                </select>
              </div>
              <div className="toolbar-field">
                <span className="toolbar-label">Durum</span>
                <select
                  value={postPublishedFilter}
                  onChange={(event) => {
                    setPostPublishedFilter(
                      event.target.value as "all" | "true" | "false",
                    );
                    setPostPage(1);
                  }}
                >
                  <option value="all">Tum durumlar</option>
                  <option value="true">Yayinda</option>
                  <option value="false">Taslak</option>
                </select>
              </div>
              <div className="toolbar-field">
                <span className="toolbar-label">Yazar</span>
                <select
                  value={postAuthorFilter}
                  onChange={(event) => {
                    setPostAuthorFilter(event.target.value);
                    setPostPage(1);
                  }}
                >
                  <option value="all">Tum yazarlar</option>
                  {authorOptions.map((author) => (
                    <option key={author.id} value={author.id}>
                      {getFullName(author)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="slideover-actions">
                <button type="submit" disabled={isLoadingPosts}>
                  <ButtonLabel icon={faMagnifyingGlass}>Uygula</ButtonLabel>
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={clearPostSearch}
                  disabled={clearPostsDisabled}
                >
                  <ButtonLabel icon={faXmark}>Temizle</ButtonLabel>
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
