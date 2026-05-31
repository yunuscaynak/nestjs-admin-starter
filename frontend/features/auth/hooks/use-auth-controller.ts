"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentUser,
  login,
  logout,
  refreshAuthSession,
  register,
} from "@/features/auth/services/auth-service";
import { createHttpClient } from "@/features/shared/services/http-client";
import { SESSION_STORAGE_KEY } from "@/features/shared/lib/constants";
import {
  getStorage,
  readStoredSession,
} from "@/features/shared/lib/helpers";
import type {
  AuthFormValues,
  AuthResponse,
  StoredSession,
} from "@/features/auth/types";
import type { UserRecord } from "@/features/users/types";

export function useAuthController() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<StoredSession | null>(null);
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authForm, setAuthForm] = useState<AuthFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    rememberMe: true,
    showPassword: false,
  });

  const persistSession = useCallback((
    payload: AuthResponse,
    options?: { authenticatedAt?: string },
  ) => {
    const session: StoredSession = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
      rememberMe: payload.rememberMe,
      authenticatedAt: options?.authenticatedAt ?? new Date().toISOString(),
    };

    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    getStorage(payload.rememberMe).setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );

    setSessionToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
    setSessionInfo(session);
    setCurrentUser(payload.user);
  }, []);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionToken(null);
    setRefreshToken(null);
    setSessionInfo(null);
    setCurrentUser(null);
  }, []);

  const refreshSession = useCallback(async (token: string) => {
    const refreshClient = createHttpClient({
      getAccessToken: () => null,
      getRefreshToken: () => null,
      refreshSession: async () => {
        throw new Error("Refresh tekrar cagrilamiyor.");
      },
      clearSession,
    });
    const data = await refreshAuthSession(refreshClient, token);
    persistSession(data, {
      authenticatedAt: sessionInfo?.authenticatedAt ?? new Date().toISOString(),
    });

    return data;
  }, [clearSession, persistSession, sessionInfo?.authenticatedAt]);

  const fetchMe = useCallback(async (token: string) => {
    const apiClient = createHttpClient({
      getAccessToken: () => token,
      getRefreshToken: () => null,
      refreshSession,
      clearSession,
    });
    const user = await fetchCurrentUser(apiClient);

    setCurrentUser(user);
    setSessionToken(token);
  }, [clearSession, refreshSession]);

  const apiClient = useMemo(
    () =>
      createHttpClient({
        getAccessToken: () => sessionToken,
        getRefreshToken: () => refreshToken,
        refreshSession,
        clearSession,
      }),
    [clearSession, refreshSession, refreshToken, sessionToken],
  );

  useEffect(() => {
    queueMicrotask(() => {
      const storedSession = readStoredSession();

      if (!storedSession) {
        setAuthLoading(false);
        return;
      }

      setSessionInfo(storedSession);

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
    });
  }, [clearSession, fetchMe, refreshSession]);

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError("");

    try {
      const data =
        authMode === "login"
          ? await login(apiClient, {
              email: authForm.email,
              password: authForm.password,
              rememberMe: authForm.rememberMe,
            })
          : await register(apiClient, {
              firstName: authForm.firstName,
              lastName: authForm.lastName,
              email: authForm.email,
              password: authForm.password,
              rememberMe: authForm.rememberMe,
            });
      persistSession(data);
      setAuthForm((current) => ({
        ...current,
        password: "",
        showPassword: false,
      }));
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
      await logout(apiClient, currentRefreshToken);
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
    sessionInfo,
    apiClient,
    handleLogout,
    authForm: {
      ...authForm,
      setFirstName: (value: string) =>
        setAuthForm((current) => ({ ...current, firstName: value })),
      setLastName: (value: string) =>
        setAuthForm((current) => ({ ...current, lastName: value })),
      setEmail: (value: string) =>
        setAuthForm((current) => ({ ...current, email: value })),
      setPassword: (value: string) =>
        setAuthForm((current) => ({ ...current, password: value })),
      setRememberMe: (value: boolean) =>
        setAuthForm((current) => ({ ...current, rememberMe: value })),
      togglePassword: () =>
        setAuthForm((current) => ({
          ...current,
          showPassword: !current.showPassword,
        })),
    },
  };
}
