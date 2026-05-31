import {
  faArrowLeft,
  faArrowRight,
  faPen,
  faPlus,
  faSliders,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconLabel } from "@/features/shared/lib/icon-label";
import {
  formatDate,
  getFullName,
  getInitials,
} from "@/features/shared/lib/helpers";
import type { UserRecord, UserSortOption } from "@/features/users/types";

type UsersPanelProps = {
  users: {
    items: UserRecord[];
    error: string;
    loading: boolean;
    total: number;
    page: number;
    hasNextPage: boolean;
    limit: number;
    sort: UserSortOption;
    appliedQuery: string;
    openDrawer: () => void;
    openFilterDrawer: () => void;
    beginEdit: (user: UserRecord) => void;
    deleteUser: (id: string) => Promise<void>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
  };
  sortOptions: Array<{ label: string; value: UserSortOption }>;
};

export function UsersPanel({ users, sortOptions }: UsersPanelProps) {
  const activeSortLabel =
    sortOptions.find((option) => option.value === users.sort)?.label ?? users.sort;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge>User</Badge>
            <h2 className="font-serif text-3xl text-(--ink)">
              Kullanici Yonetimi
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={users.openFilterDrawer}>
              <IconLabel icon={faSliders}>Filtreler</IconLabel>
            </Button>
            <Button onClick={users.openDrawer} disabled={users.loading}>
              <IconLabel icon={faPlus}>Yeni Kullanici</IconLabel>
            </Button>
          </div>
        </div>

        {users.error ? (
          <p className="mb-4 rounded-xl border border-[rgba(248,113,113,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm font-medium text-(--danger)">
            {users.error}
          </p>
        ) : null}

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel-deep)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-(--ink-muted)">
              Toplam kayit
            </p>
            <p className="mt-3 font-serif text-4xl text-(--ink)">
              {users.loading ? "..." : users.total}
            </p>
          </article>
          <article className="rounded-2xl border border-(--line) bg-[var(--panel-deep)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-(--ink-muted)">
              Sayfa
            </p>
            <p className="mt-3 font-serif text-3xl text-(--ink)">{users.page}</p>
          </article>
          <article className="rounded-2xl border border-(--line) bg-[var(--panel-deep)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-(--ink-muted)">
              Siralama
            </p>
            <p className="mt-3 text-sm font-medium text-(--ink)">{activeSortLabel}</p>
          </article>
          <article className="rounded-2xl border border-(--line) bg-[var(--panel-deep)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-(--ink-muted)">
              Filtre
            </p>
            <p className="mt-3 text-sm font-medium text-(--ink)">
              {users.appliedQuery || "Tum kullanicilar"}
            </p>
          </article>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {!users.loading && users.items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-(--line) bg-[var(--panel-deep)] px-5 py-8 text-center text-sm text-(--ink-muted) md:col-span-2 2xl:col-span-3">
              Bu filtrelere uygun kullanici yok.
            </p>
          ) : null}

          {users.items.map((user) => (
            <article
              key={user.id}
              className="group relative overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--panel-deep)] p-5 transition duration-200 hover:border-[var(--line-strong)]"
            >
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[var(--line)] bg-[var(--panel)] font-serif text-lg text-(--ink)">
                    {getInitials(user)}
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-[rgba(0,173,181,0.22)] bg-[rgba(0,173,181,0.12)] text-(--accent)">
                        {user.role}
                      </Badge>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-(--ink-muted)">
                        user profile
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-[28px] leading-none text-(--ink)">
                        {getFullName(user)}
                      </h3>
                      <p className="text-sm text-(--ink-muted)">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-(--ink-muted)">
                    Kayit tarihi
                  </p>
                  <time className="mt-3 block text-sm font-medium text-(--ink)">
                    {formatDate(user.createdAt)}
                  </time>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-(--ink-muted)">
                    Erisim seviyesi
                  </p>
                  <p className="mt-3 text-sm font-medium text-(--ink)">
                    {user.role === "ADMIN" ? "Tam yonetim izni" : "Standart hesap"}
                  </p>
                </div>
              </div>

              <div className="relative mt-6 flex flex-wrap gap-3 border-t border-[rgba(255,255,255,0.08)] pt-4">
                <Button
                  variant="secondary"
                  className="min-w-35 flex-1 border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--panel-soft)]"
                  onClick={() => users.beginEdit(user)}
                >
                  <IconLabel icon={faPen}>Duzenle</IconLabel>
                </Button>
                <Button
                  variant="destructive"
                  className="min-w-35 flex-1"
                  onClick={() => void users.deleteUser(user.id)}
                >
                  <IconLabel icon={faTrash}>Sil</IconLabel>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-(--line) pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {users.appliedQuery ? <Badge>Arama: {users.appliedQuery}</Badge> : null}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => users.setPage((previousPage) => Math.max(1, previousPage - 1))}
              disabled={users.loading || users.page === 1}
            >
              <IconLabel icon={faArrowLeft}>Onceki</IconLabel>
            </Button>
            <span className="text-sm font-medium text-(--ink-muted)">
              Sayfa {users.page}
            </span>
            <Button
              onClick={() => users.setPage((previousPage) => previousPage + 1)}
              disabled={users.loading || !users.hasNextPage}
            >
              <IconLabel icon={faArrowRight}>Sonraki</IconLabel>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
