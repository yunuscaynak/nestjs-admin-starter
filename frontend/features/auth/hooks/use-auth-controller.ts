"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentUser,
  login,
  logout,
  refreshAuthSession,
  register,
} from "@/features/auth/services/api";
import { createApiClient } from "@/features/shared/services/api-client";
import { SESSION_STORAGE_KEY } from "@/features/shared/lib/constants";
import {
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

  const refreshSession = useCallback(async (token: string) => {
    const refreshClient = createApiClient({
      getAccessToken: () => null,
      getRefreshToken: () => null,
      refreshSession: async () => {
        throw new Error("Refresh tekrar cagrilamiyor.");
      },
      clearSession,
    });
    const data = await refreshAuthSession(refreshClient, token);
    persistSession(data);

    return data;
  }, [clearSession, persistSession]);

  const fetchMe = useCallback(async (token: string) => {
    const apiClient = createApiClient({
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
      createApiClient({
        getAccessToken: () => sessionToken,
        getRefreshToken: () => refreshToken,
        refreshSession,
        clearSession,
      }),
    [clearSession, refreshSession, refreshToken, sessionToken],
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

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError("");

    try {
      const data =
        authMode === "login"
          ? await login(apiClient, {
              email: authEmail,
              password: authPassword,
              rememberMe: authRememberMe,
            })
          : await register(apiClient, {
              firstName: authFirstName,
              lastName: authLastName,
              email: authEmail,
              password: authPassword,
              rememberMe: authRememberMe,
            });
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
    apiClient,
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
