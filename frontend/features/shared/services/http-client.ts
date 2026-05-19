"use client";

import { getErrorMessage } from "../lib/helpers";
import type { AuthResponse } from "@/features/auth/types";
import { getApiBaseUrl } from "./http-config";

type QueryValue = string | number | boolean | null | undefined;
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

type HttpRequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: BodyInit | object | null;
  query?: Record<string, QueryValue>;
  timeoutMs?: number;
};

type HttpClientOptions = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  refreshSession: (refreshToken: string) => Promise<AuthResponse>;
  clearSession: () => void;
};

export type HttpClient = ReturnType<typeof createHttpClient>;

const API_BASE_URL = getApiBaseUrl();

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

function normalizeBody(body: HttpRequestOptions["body"], headers: Headers) {
  if (body == null || body instanceof FormData || typeof body === "string") {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

function createRequestHeaders(headers?: HeadersInit) {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("X-Request-Id") && typeof crypto.randomUUID === "function") {
    requestHeaders.set("X-Request-Id", crypto.randomUUID());
  }

  return requestHeaders;
}

function withRequestTimeout(timeoutMs: number, signal?: AbortSignal) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort(new DOMException("Request timed out.", "AbortError"));
  }, timeoutMs);

  const abortFromUpstream = () => {
    controller.abort(signal?.reason);
  };

  if (signal) {
    if (signal.aborted) {
      abortFromUpstream();
    } else {
      signal.addEventListener("abort", abortFromUpstream, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortFromUpstream);
    },
  };
}

export function createHttpClient({
  getAccessToken,
  getRefreshToken,
  refreshSession,
  clearSession,
}: HttpClientOptions) {
  async function request<T>(path: string, options: HttpRequestOptions = {}) {
    const {
      auth = true,
      body,
      query,
      headers,
      timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
      signal: requestSignal,
      ...init
    } = options;
    const url = buildUrl(path, query);

    const execute = async (accessToken?: string | null) => {
      const requestHeaders = createRequestHeaders(headers);
      const requestTimeout = withRequestTimeout(
        timeoutMs,
        requestSignal ?? undefined,
      );

      if (auth) {
        if (!accessToken) {
          throw new Error("Oturum bulunamadi.");
        }

        requestHeaders.set("Authorization", `Bearer ${accessToken}`);
      }

      try {
        return await fetch(url, {
          ...init,
          signal: requestTimeout.signal,
          headers: requestHeaders,
          body: normalizeBody(body, requestHeaders),
        });
      } finally {
        requestTimeout.cleanup();
      }
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
    get<T>(
      path: string,
      options?: Omit<HttpRequestOptions, "method" | "body">,
    ) {
      return request<T>(path, options);
    },
    post<T>(
      path: string,
      body?: HttpRequestOptions["body"],
      options?: Omit<HttpRequestOptions, "method" | "body">,
    ) {
      return request<T>(path, { ...options, method: "POST", body });
    },
    patch<T>(
      path: string,
      body?: HttpRequestOptions["body"],
      options?: Omit<HttpRequestOptions, "method" | "body">,
    ) {
      return request<T>(path, { ...options, method: "PATCH", body });
    },
    delete<T>(
      path: string,
      options?: Omit<HttpRequestOptions, "method" | "body">,
    ) {
      return request<T>(path, { ...options, method: "DELETE" });
    },
  };
}
