"use client";

import { FormEvent, useEffect, useState } from "react";

type UserRecord = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

type ApiError = {
  message?: string | string[];
};

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

export default function Home() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  async function loadUsers() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }
      const data = (await response.json()) as UserRecord[];
      setUsers(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kullanıcılar alınamadı.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }
      setName("");
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
    setEditName(user.name);
    setEditEmail(user.email);
  }

  async function handleUpdate(id: number) {
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail }),
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

  async function handleDelete(id: number) {
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

  return (
    <main className="page">
      <section className="panel">
        <div className="panel-header">
          <h1>Kullanıcı Yönetimi</h1>
          <p>
            API: <code>{API_BASE_URL}/users</code>
          </p>
        </div>

        <form onSubmit={handleCreate} className="create-form">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ad"
            required
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-posta"
            type="email"
            required
          />
          <button type="submit">Kullanıcı Ekle</button>
        </form>

        {error ? <p className="error">{error}</p> : null}

        <div className="list-wrapper">
          {isLoading ? <p>Yükleniyor...</p> : null}
          {!isLoading && users.length === 0 ? (
            <p>Henüz kullanıcı yok.</p>
          ) : null}
          {users.map((user) => (
            <article key={user.id} className="user-card">
              <div className="user-card-top">
                <strong>#{user.id}</strong>
                <span>{new Date(user.createdAt).toLocaleString("tr-TR")}</span>
              </div>

              {editingId === user.id ? (
                <div className="edit-form">
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                  />
                  <input
                    value={editEmail}
                    type="email"
                    onChange={(event) => setEditEmail(event.target.value)}
                  />
                  <div className="actions">
                    <button onClick={() => void handleUpdate(user.id)}>
                      Kaydet
                    </button>
                    <button
                      className="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              ) : (
                <div className="user-data">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <div className="actions">
                    <button onClick={() => beginEdit(user)}>Düzenle</button>
                    <button className="danger" onClick={() => void handleDelete(user.id)}>
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
