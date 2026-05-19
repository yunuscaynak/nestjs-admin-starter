"use client";

import { API_BASE_URL } from "../lib/constants";
import { getErrorMessage } from "../lib/helpers";
import type { AuthResponse } from "../lib/types";

type QueryValue = string | number | boolean | null | undefined;

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: BodyInit | object | null;
  query?: Record<string, QueryValue>;
};

type ApiClientOptions = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  refreshSession: (refreshToken: string) => Promise<AuthResponse>;
  clearSession: () => void;
};

export type ApiClient = ReturnType<typeof createApiClient>;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, `${API_BASE_URL}/`);

  if (!query) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function normalizeBody(body: RequestOptions["body"], headers: Headers) {
  if (body == null || body instanceof FormData || typeof body === "string") {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

export function createApiClient({
  getAccessToken,
  getRefreshToken,
  refreshSession,
  clearSession,
}: ApiClientOptions) {
  async function request<T>(path: string, options: RequestOptions = {}) {
    const { auth = true, body, query, headers, ...init } = options;
    const url = buildUrl(path, query);

    const execute = async (accessToken?: string | null) => {
      const requestHeaders = new Headers(headers);

      if (auth) {
        if (!accessToken) {
          throw new Error("Oturum bulunamadi.");
        }

        requestHeaders.set("Authorization", `Bearer ${accessToken}`);
      }

      return fetch(url, {
        ...init,
        headers: requestHeaders,
        body: normalizeBody(body, requestHeaders),
      });
    };

    let response = await execute(auth ? getAccessToken() : null);

    if (auth && response.status === 401) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearSession();
        throw new Error("Oturum suresi doldu. Tekrar giris yapin.");
      }

      try {
        const refreshedSession = await refreshSession(refreshToken);
        response = await execute(refreshedSession.accessToken);
      } catch {
        clearSession();
        throw new Error("Oturum suresi doldu. Tekrar giris yapin.");
      }
    }

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(
        `${init.method ?? "GET"} ${url} failed with ${response.status}: ${errorMessage}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return {
    request,
    get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
      return request<T>(path, options);
    },
    post<T>(
      path: string,
      body?: RequestOptions["body"],
      options?: Omit<RequestOptions, "method" | "body">,
    ) {
      return request<T>(path, { ...options, method: "POST", body });
    },
    patch<T>(
      path: string,
      body?: RequestOptions["body"],
      options?: Omit<RequestOptions, "method" | "body">,
    ) {
      return request<T>(path, { ...options, method: "PATCH", body });
    },
    delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
      return request<T>(path, { ...options, method: "DELETE" });
    },
  };
}
