import {
  faRightToBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckboxField } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconLabel } from "@/features/shared/lib/icon-label";
import { PasswordField } from "@/features/shared/lib/password-field";

type AuthScreenProps = {
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  authError: string;
  isSubmittingAuth: boolean;
  submitAuth: (event: React.FormEvent<HTMLFormElement>) => void;
  authForm: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    rememberMe: boolean;
    showPassword: boolean;
    setFirstName: (value: string) => void;
    setLastName: (value: string) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setRememberMe: (value: boolean) => void;
    togglePassword: () => void;
  };
};

export function AuthScreen({
  authMode,
  setAuthMode,
  authError,
  isSubmittingAuth,
  submitAuth,
  authForm,
}: AuthScreenProps) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 md:px-8 md:py-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-[var(--line-strong)]">
          <CardContent className="grid h-full content-between gap-10 p-8 md:p-10">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-5">
                <Badge>Admin Starter</Badge>
                <Badge className="bg-[var(--accent-soft)] text-[var(--accent)]">
                  JWT Protected
                </Badge>
              </div>
              <div className="space-y-5">
                <h1 className="max-w-4xl font-serif text-5xl leading-none text-(--ink) md:text-7xl">
                  Operasyon odakli, duz renkli bir yonetim kabugu.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-(--ink-muted) md:text-lg">
                  Kimlik dogrulama, kullanici yonetimi ve post operasyonlari
                  ayni panel sistemi icinde toplanir. Ilk kayit olan hesap
                  otomatik admin yetkisi alir.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel-deep)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)">
                  Auth
                </p>
                <p className="mt-3 text-sm leading-6 text-(--ink)">
                  Register, login ve session akisi tek kabukta.
                </p>
              </article>
              <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel-deep)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)">
                  Access
                </p>
                <p className="mt-3 text-sm leading-6 text-(--ink)">
                  Rol bazli kontrol ile admin ve standart hesap ayrimi.
                </p>
              </article>
              <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel-deep)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)">
                  Content
                </p>
                <p className="mt-3 text-sm leading-6 text-(--ink)">
                  User ve post CRUD akislarina hazir baslangic zemini.
                </p>
              </article>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/posts"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-deep)] px-5 text-sm font-semibold text-foreground transition hover:bg-[var(--panel-soft)]"
              >
                Public postlari incele
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--line-strong)]">
          <CardContent className="p-6 md:p-8">
            <CardHeader className="mb-6 px-0">
              <Badge className="w-fit">Oturum</Badge>
              <CardTitle className="text-(--ink)">
                {authMode === "login" ? "Giris yap" : "Hesap olustur"}
              </CardTitle>
              <CardDescription>
                Panel akisi tek ekranda; auth, users ve posts ayni frontend
                kabugunda.
              </CardDescription>
            </CardHeader>

            <TabsList className="mb-6 grid-cols-2">
              <TabsTrigger
                active={authMode === "login"}
                onClick={() => setAuthMode("login")}
              >
                <IconLabel icon={faRightToBracket}>Giris Yap</IconLabel>
              </TabsTrigger>
              <TabsTrigger
                active={authMode === "register"}
                onClick={() => setAuthMode("register")}
              >
                <IconLabel icon={faUserPlus}>Kayit Ol</IconLabel>
              </TabsTrigger>
            </TabsList>

            <form onSubmit={submitAuth} className="grid gap-4">
              {authMode === "register" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    value={authForm.firstName}
                    onChange={(event) => authForm.setFirstName(event.target.value)}
                    placeholder="Ad"
                    required
                  />
                  <Input
                    value={authForm.lastName}
                    onChange={(event) => authForm.setLastName(event.target.value)}
                    placeholder="Soyad"
                    required
                  />
                </div>
              ) : null}

              <Input
                value={authForm.email}
                onChange={(event) => authForm.setEmail(event.target.value)}
                placeholder="E-posta"
                type="email"
                required
              />
              <PasswordField
                value={authForm.password}
                onChange={authForm.setPassword}
                placeholder="Sifre"
                visible={authForm.showPassword}
                onToggle={authForm.togglePassword}
                required
              />
              <CheckboxField
                checked={authForm.rememberMe}
                onChange={(event) => authForm.setRememberMe(event.target.checked)}
              >
                Beni hatirla
              </CheckboxField>

              <Button type="submit" disabled={isSubmittingAuth} className="mt-2">
                {isSubmittingAuth
                  ? "Bekleyin..."
                  : authMode === "login"
                    ? <IconLabel icon={faRightToBracket}>Giris Yap</IconLabel>
                    : <IconLabel icon={faUserPlus}>Hesap Olustur</IconLabel>}
              </Button>
            </form>

            {authError ? (
              <p className="mt-4 rounded-xl border border-[rgba(248,113,113,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm font-medium text-(--danger)">
                {authError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
