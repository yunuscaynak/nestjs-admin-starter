import type { ApiError, StoredSession, UserRecord } from "./types";
import { SESSION_STORAGE_KEY } from "./constants";

export async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as ApiError;
    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // Body bos veya JSON degilse varsayilan mesaji kullan.
  }

  return "Bilinmeyen bir hata olustu.";
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("tr-TR");
}

export function getFullName(user: Pick<UserRecord, "firstName" | "lastName">) {
  return `${user.firstName} ${user.lastName}`;
}

export function getStorage(rememberMe: boolean) {
  return rememberMe ? window.localStorage : window.sessionStorage;
}

export function readStoredSession(): StoredSession | null {
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
