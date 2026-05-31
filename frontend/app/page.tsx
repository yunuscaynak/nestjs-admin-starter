"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { useAuthController } from "@/features/auth/hooks/use-auth-controller";
import { DashboardScreen } from "@/features/shared/components/dashboard-screen";
import { useAdminController } from "@/features/shared/lib/use-admin-controller";

export default function Home() {
  const auth = useAuthController();
  const isAdmin = auth.currentUser?.role === "ADMIN";

  const admin = useAdminController({
    isAdmin: Boolean(isAdmin),
    sessionToken: auth.sessionToken,
    apiClient: auth.apiClient,
  });

  if (auth.authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <Card className="w-full max-w-xl">
          <CardContent className="space-y-3 p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--ink-muted)">
              Yukleniyor
            </p>
            <h1 className="font-serif text-4xl text-(--ink)">
              Oturum kontrol ediliyor
            </h1>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!auth.currentUser) {
    return (
      <AuthScreen
        authMode={auth.authMode}
        setAuthMode={(mode) => {
          auth.setAuthMode(mode);
        }}
        authError={auth.authError}
        isSubmittingAuth={auth.isSubmittingAuth}
        submitAuth={auth.submitAuth}
        authForm={auth.authForm}
      />
    );
  }

  return (
    <DashboardScreen
      currentUser={auth.currentUser}
      onLogout={auth.handleLogout}
      sessionInfo={auth.sessionInfo}
      admin={admin}
    />
  );
}
