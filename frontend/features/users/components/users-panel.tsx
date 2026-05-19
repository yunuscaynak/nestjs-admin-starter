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
import { formatDate, getFullName } from "@/features/shared/lib/helpers";
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
  return (
    <Card className="bg-[rgba(57,62,70,0.86)]">
      <CardContent className="p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge>User</Badge>
            <h2 className="font-serif text-3xl text-[var(--ink)]">
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
          <p className="mb-4 rounded-2xl border border-[rgba(166,41,41,0.15)] bg-[rgba(166,41,41,0.08)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
            {users.error}
          </p>
        ) : null}

        <div className="grid gap-4">
          {!users.loading && users.items.length === 0 ? (
            <p className="rounded-[24px] border border-dashed border-[var(--line)] bg-[rgba(34,40,49,0.6)] px-5 py-8 text-center text-sm text-[var(--ink-muted)]">
              Bu filtrelere uygun kullanici yok.
            </p>
          ) : null}

          {users.items.map((user) => (
            <article
              key={user.id}
              className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-[rgba(34,40,49,0.7)] p-5 md:grid-cols-[1fr_auto]"
            >
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[var(--ink)]">
                  {getFullName(user)}
                </h3>
                <p className="text-sm text-[var(--ink-muted)]">{user.email}</p>
              </div>
              <div className="grid gap-3 text-sm text-[var(--ink-muted)] md:justify-items-end">
                <Badge className="border-[rgba(0,173,181,0.18)] bg-[rgba(0,173,181,0.12)] text-[var(--accent)]">
                  {user.role}
                </Badge>
                <span>#{user.id.slice(0, 8)}</span>
                <time>{formatDate(user.createdAt)}</time>
              </div>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button variant="secondary" onClick={() => users.beginEdit(user)}>
                  <IconLabel icon={faPen}>Duzenle</IconLabel>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void users.deleteUser(user.id)}
                >
                  <IconLabel icon={faTrash}>Sil</IconLabel>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-[var(--line)] pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge>{users.loading ? "Yukleniyor..." : `${users.total} kayit`}</Badge>
            <Badge>
              Siralama: {sortOptions.find((option) => option.value === users.sort)?.label ?? users.sort}
            </Badge>
            <Badge>{users.limit} / sayfa</Badge>
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
            <span className="text-sm font-medium text-[var(--ink-muted)]">
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
