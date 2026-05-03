"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
    // Response body boş veya JSON değilse default mesaja düş.
  }
  return "Bilinmeyen bir hata oluştu.";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("tr-TR");
}

function getFullName(user: UserRecord) {
  return `${user.firstName} ${user.lastName}`;
}

export default function Home() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(20);
  const [sort, setSort] = useState<UserSortOption>("createdAt:desc");
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);

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

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(listUrl, {
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
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanıcılar alınamadı.",
      );
      setUsers([]);
      setTotalUsers(0);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, [listUrl, page]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }
      setFirstName("");
      setLastName("");
      setEmail("");
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanıcı oluşturulamadı.",
      );
    }
  }

  function beginEdit(user: UserRecord) {
    setEditingId(user.id);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditEmail(user.email);
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
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
        }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }
      setEditingId(null);
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanıcı güncellenemedi.",
      );
    }
  }

  async function handleDelete(id: string) {
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanıcı silinemedi.",
      );
    }
  }

  const clearDisabled =
    isLoading || (searchInput.trim().length === 0 && appliedQuery.length === 0);

  return (
    <main className="page">
      <section className="container">
        <header className="page-header">
          <h1>Kullanıcı Yönetimi</h1>
        </header>

        <section className="card create-card">
          <h2>Yeni Kullanıcı</h2>
          <form onSubmit={handleCreate} className="create-form">
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
            <button type="submit" disabled={isLoading}>
              Ekle
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
            <button type="submit" disabled={isLoading}>
              Uygula
            </button>
            <button
              type="button"
              className="ghost"
              onClick={clearSearch}
              disabled={clearDisabled}
            >
              Temizle
            </button>
          </form>

          <div className="list-meta">
            <div className="list-meta-left">
              <strong>{isLoading ? "Yükleniyor..." : `${totalUsers} kayıt`}</strong>
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
                disabled={isLoading || page === 1}
              >
                Önceki
              </button>
              <span>Sayfa {page}</span>
              <button
                type="button"
                onClick={() => setPage((previousPage) => previousPage + 1)}
                disabled={isLoading || !hasNextPage}
              >
                Sonraki
              </button>
            </div>
          </div>

          {error ? <p className="error">{error}</p> : null}

          <div className="list-wrapper">
            {!isLoading && users.length === 0 ? (
              <p className="empty-state">Bu filtrelere uygun kullanıcı yok.</p>
            ) : null}
            {users.map((user) => (
              <article key={user.id} className="user-card">
                {editingId === user.id ? (
                  <div className="edit-form">
                    <input
                      value={editFirstName}
                      onChange={(event) => setEditFirstName(event.target.value)}
                    />
                    <input
                      value={editLastName}
                      onChange={(event) => setEditLastName(event.target.value)}
                    />
                    <input
                      value={editEmail}
                      type="email"
                      onChange={(event) => setEditEmail(event.target.value)}
                    />
                    <div className="actions">
                      <button type="button" onClick={() => void handleUpdate(user.id)}>
                        Kaydet
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Vazgeç
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
                        <span>#{user.id.slice(0, 8)}</span>
                        <time>{formatDate(user.createdAt)}</time>
                      </div>
                    </div>
                    <div className="actions">
                      <button type="button" onClick={() => beginEdit(user)}>
                        Düzenle
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => void handleDelete(user.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
