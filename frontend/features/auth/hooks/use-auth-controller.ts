"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, SESSION_STORAGE_KEY } from "@/features/shared/lib/constants";
import {
  getErrorMessage,
  getStorage,
  readStoredSession,
} from "@/features/shared/lib/helpers";
import type {
  AuthResponse,
  StoredSession,
  UserRecord,
} from "@/features/shared/lib/types";

export function useAuthController() {
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
  }, []);

  const fetchMe = useCallback(async (token: string) => {
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
  }, []);

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

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError("");

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        authMode === "login"
          ? {
              email: authEmail,
              password: authPassword,
              rememberMe: authRememberMe,
            }
          : {
              firstName: authFirstName,
              lastName: authLastName,
              email: authEmail,
              password: authPassword,
              rememberMe: authRememberMe,
            };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      // Cikis deneyimini bloklamamak icin hata yutulur.
    }
  }

  return {
    authMode,
    setAuthMode,
    currentUser,
    authLoading,
    isSubmittingAuth,
    authError,
    submitAuth,
    sessionToken,
    authorizedFetch,
    handleLogout,
    authForm: {
      firstName: authFirstName,
      lastName: authLastName,
      email: authEmail,
      password: authPassword,
      rememberMe: authRememberMe,
      showPassword: showAuthPassword,
      setFirstName: setAuthFirstName,
      setLastName: setAuthLastName,
      setEmail: setAuthEmail,
      setPassword: setAuthPassword,
      setRememberMe: setAuthRememberMe,
      togglePassword: () => setShowAuthPassword((current) => !current),
    },
  };
}
