import {
  faRightToBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
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
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(0,173,181,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(57,62,70,0.32),transparent_28%),linear-gradient(180deg,#222831_0%,#393E46_100%)] px-4 py-10 md:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(238,238,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(238,238,238,0.05)_1px,transparent_1px)] bg-[size:34px_34px] opacity-50" />
      <section className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-[var(--line)] bg-[linear-gradient(135deg,#222831_0%,#393E46_62%,#00ADB5_100%)] text-[var(--foreground)]">
          <CardContent className="grid min-h-[560px] content-between gap-12 p-8 md:p-12">
            <div className="space-y-6">
              <Badge className="border-[rgba(238,238,238,0.12)] bg-[rgba(34,40,49,0.42)] text-[rgba(238,238,238,0.8)]">
                Nest CRUD
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-serif text-5xl leading-none md:text-7xl">
                  JWT ile korunan, operasyon odakli yonetim paneli.
                </h1>
                <p className="max-w-2xl text-base text-[rgba(238,238,238,0.78)] md:text-lg">
                  Ilk kayit olan hesap otomatik olarak admin olur. Sonrasinda
                  kullanici ve post akislari tek bir operasyon katmaninda
                  yonetilir.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge className="border-[rgba(238,238,238,0.12)] bg-[rgba(34,40,49,0.42)] text-[var(--foreground)]">
                Register/Login endpoint
              </Badge>
              <Badge className="border-[rgba(238,238,238,0.12)] bg-[rgba(34,40,49,0.42)] text-[var(--foreground)]">
                JWT guard
              </Badge>
              <Badge className="border-[rgba(238,238,238,0.12)] bg-[rgba(34,40,49,0.42)] text-[var(--foreground)]">
                Role tabanli yetki
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--line)] bg-[rgba(57,62,70,0.82)]">
          <CardContent className="p-6 md:p-8">
            <CardHeader className="mb-6 px-0">
              <Badge className="w-fit">Oturum</Badge>
              <CardTitle className="text-[var(--ink)]">
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
              <p className="mt-4 rounded-2xl border border-[rgba(166,41,41,0.15)] bg-[rgba(166,41,41,0.08)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
                {authError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
