"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faArrowRightFromBracket,
  faBan,
  faEye,
  faEyeSlash,
  faFloppyDisk,
  faMagnifyingGlass,
  faPen,
  faPlus,
  faTrash,
  faUserPlus,
  faRightToBracket,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

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
  children: React.ReactNode;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRole, setEditRole] = useState<Role>("USER");
  const [totalUsers, setTotalUsers] = useState(0);

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
    setTotalUsers(0);
    setUsersError("");
    setEditingId(null);
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

  useEffect(() => {
    if (!authLoading && isAdmin) {
      void loadUsers();
    }
  }, [authLoading, isAdmin, loadUsers]);

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
      await loadUsers();
    } catch (requestError) {
      setUsersError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanici olusturulamadi.",
      );
    }
  }

  function beginEdit(user: UserRecord) {
    setEditingId(user.id);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditEmail(user.email);
    setEditPassword("");
    setShowEditPassword(false);
    setEditRole(user.role);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedQuery(searchInput.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearchInput("");
    setAppliedQuery("");
    setPage(1);
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

      setEditingId(null);
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

  const clearDisabled =
    isLoadingUsers ||
    (searchInput.trim().length === 0 && appliedQuery.length === 0);

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
            <section className="card create-card">
              <h2>Yeni Kullanici</h2>
              <form onSubmit={handleCreate} className="create-form expanded">
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
                <button type="submit" disabled={isLoadingUsers}>
                  <ButtonLabel icon={faPlus}>Ekle</ButtonLabel>
                </button>
              </form>
            </section>

            <section className="card list-card">
              <form onSubmit={handleSearch} className="toolbar">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Ad veya e-posta ara"
                />
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
              </form>

              <div className="list-meta">
                <div className="list-meta-left">
                  <strong>
                    {isLoadingUsers ? "Yukleniyor..." : `${totalUsers} kayit`}
                  </strong>
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

              {usersError ? <p className="error">{usersError}</p> : null}

              <div className="list-wrapper">
                {!isLoadingUsers && users.length === 0 ? (
                  <p className="empty-state">
                    Bu filtrelere uygun kullanici yok.
                  </p>
                ) : null}
                {users.map((user) => (
                  <article key={user.id} className="user-card">
                    {editingId === user.id ? (
                      <div className="edit-form">
                        <input
                          value={editFirstName}
                          onChange={(event) =>
                            setEditFirstName(event.target.value)
                          }
                        />
                        <input
                          value={editLastName}
                          onChange={(event) =>
                            setEditLastName(event.target.value)
                          }
                        />
                        <input
                          value={editEmail}
                          type="email"
                          onChange={(event) => setEditEmail(event.target.value)}
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
                          onChange={(event) =>
                            setEditRole(event.target.value as Role)
                          }
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <div className="actions">
                          <button
                            type="button"
                            onClick={() => void handleUpdate(user.id)}
                          >
                            <ButtonLabel icon={faFloppyDisk}>Kaydet</ButtonLabel>
                          </button>
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            <ButtonLabel icon={faBan}>Vazgec</ButtonLabel>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                          <button type="button" onClick={() => beginEdit(user)}>
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
                      </>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
