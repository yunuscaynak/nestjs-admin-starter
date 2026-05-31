import {
  faArrowRightFromBracket,
  faChartSimple,
  faClock,
  faFileLines,
  faGear,
  faGlobe,
  faLayerGroup,
  faLink,
  faShieldHalved,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StoredSession } from "@/features/auth/types";
import { PostFiltersSheet } from "@/features/posts/components/post-filters-sheet";
import { PostSheet } from "@/features/posts/components/post-sheet";
import { PostsPanel } from "@/features/posts/components/posts-panel";
import { UserFiltersSheet } from "@/features/users/components/user-filters-sheet";
import { UserSheet } from "@/features/users/components/user-sheet";
import { UsersPanel } from "@/features/users/components/users-panel";
import type { UserRecord } from "@/features/users/types";
import { IconLabel } from "../lib/icon-label";
import { formatDate, getFullName, getInitials } from "../lib/helpers";
import type { AdminController } from "../lib/use-admin-controller";

type DashboardScreenProps = {
  currentUser: UserRecord;
  onLogout: () => Promise<void>;
  sessionInfo: StoredSession | null;
  admin: AdminController;
};

export function DashboardScreen({
  currentUser,
  onLogout,
  sessionInfo,
  admin,
}: DashboardScreenProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isAdmin = currentUser.role === "ADMIN";
  const activeDataset = admin.activeAdminTab === "users" ? admin.users : admin.posts;
  const activeTotal = activeDataset.loading ? "..." : String(activeDataset.total);
  const activeSectionLabel =
    admin.activeAdminTab === "users" ? "Kullanici Yonetimi" : "Post Yonetimi";
  const environment =
    process.env.NODE_ENV === "production"
      ? "production"
      : process.env.NODE_ENV === "test"
        ? "test"
        : "dev";
  const recentUser = useMemo(
    () =>
      [...admin.users.items].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )[0] ?? null,
    [admin.users.items],
  );
  const recentPost = useMemo(
    () =>
      [...admin.posts.items].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )[0] ?? null,
    [admin.posts.items],
  );
  const tokenStatus = sessionInfo?.accessTokenExpiresAt
    ? formatDate(sessionInfo.accessTokenExpiresAt)
    : "Bilinmiyor";

  return (
    <main className="min-h-screen bg-[var(--background)] px-2 py-4 md:px-4 md:py-6">
      <section className="grid w-full max-w-[1680px] gap-5 lg:grid-cols-[312px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card className="overflow-hidden border-[var(--line-strong)]">
            <CardContent className="flex flex-col gap-6 p-4 md:p-5">
              <SidebarSection title="Navigasyon">
                <div className="space-y-2">
                  <SidebarNavButton
                    active={admin.activeAdminTab === "users"}
                    icon={faUsers}
                    label="Kullanicilar"
                    meta={admin.users.loading ? "Yukleniyor" : `${admin.users.total} kayit`}
                    description="Hesaplar, roller ve erisim akisi"
                    onClick={() => admin.setActiveAdminTab("users")}
                  />
                  <SidebarNavButton
                    active={admin.activeAdminTab === "posts"}
                    icon={faFileLines}
                    label="Postlar"
                    meta={admin.posts.loading ? "Yukleniyor" : `${admin.posts.total} kayit`}
                    description="Icerik, yayin ve yazar akisi"
                    onClick={() => admin.setActiveAdminTab("posts")}
                  />
                  <SidebarLinkCard
                    href="/posts"
                    icon={faGlobe}
                    label="Public Posts"
                    description="Yayindaki icerigin public gorunumu"
                  />
                </div>
              </SidebarSection>

              <SidebarSection title="Oturum">
                <div className="grid gap-2">
                  <SessionStat
                    icon={faClock}
                    label="Son giris"
                    value={
                      sessionInfo?.authenticatedAt
                        ? formatDate(sessionInfo.authenticatedAt)
                        : "Bu oturumda"
                    }
                  />
                  <SessionStat
                    icon={faShieldHalved}
                    label="Aktif rol"
                    value={currentUser.role}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <CompactStat label="Token" value={tokenStatus} icon={faLink} />
                    <CompactStat label="Ortam" value={environment} icon={faChartSimple} />
                  </div>
                </div>
              </SidebarSection>

              <SidebarSection title="Son Islemler">
                <div className="grid gap-2">
                  <RecentActivityCard
                    icon={faUsers}
                    title="Son eklenen kullanici"
                    value={recentUser ? getFullName(recentUser) : "Henuz yuklenmedi"}
                    meta={recentUser ? formatDate(recentUser.createdAt) : "Liste bekleniyor"}
                  />
                  <RecentActivityCard
                    icon={faFileLines}
                    title="Son guncellenen post"
                    value={recentPost ? recentPost.title : "Henuz yuklenmedi"}
                    meta={recentPost ? formatDate(recentPost.updatedAt) : "Liste bekleniyor"}
                  />
                </div>
              </SidebarSection>

              <div className="mt-auto rounded-[22px] border border-[var(--line)] bg-[var(--panel-deep)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel)] font-serif text-lg text-(--ink)">
                      {getInitials(currentUser)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-(--ink)">
                        {getFullName(currentUser)}
                      </p>
                      <p className="truncate text-xs text-(--ink-muted)">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)">
                        Calisma Alani
                      </p>
                      <p className="mt-1 text-sm font-semibold text-(--ink)">
                        {activeSectionLabel}
                      </p>
                    </div>
                    <span className="rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                      {environment}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSettingsOpen((current) => !current)}
                  >
                    <IconLabel icon={faGear}>Ayarlar</IconLabel>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => void onLogout()}
                  >
                    <IconLabel icon={faArrowRightFromBracket}>Cikis</IconLabel>
                  </Button>
                </div>

                {settingsOpen ? (
                  <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 text-xs leading-5 text-(--ink-muted)">
                    Profil tercihleri icin ayri ayarlar sayfasi henuz yok. Bu alan
                    daha sonra bildirimler, parola ve oturum politikalari icin
                    genisletilebilir.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="grid gap-6">
          <Card className="overflow-hidden border-[var(--line-strong)]">
            <CardContent className="grid gap-6 p-6 md:p-8">
              <div className="flex flex-col gap-5 border-b border-[var(--line)] pb-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-3">
                  <Badge>Aktif Alan</Badge>
                  <h2 className="font-serif text-4xl text-(--ink) md:text-5xl">
                    {activeSectionLabel}
                  </h2>
                  <p className="max-w-3xl text-sm leading-6 text-(--ink-muted) md:text-base">
                    {isAdmin
                      ? "Sol navigasyon operasyon alanlarini ayirir. Secili modulde filtre, ekleme ve guncelleme akislarina ayni panelden devam edebilirsin."
                      : "Bu hesap giris yapti ancak users ve posts operasyonlari sadece admin kullanicilar icin acik."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <HeaderMetric
                    label="Rol"
                    value={currentUser.role}
                    icon={faShieldHalved}
                  />
                  <HeaderMetric
                    label="Modul"
                    value={admin.activeAdminTab === "users" ? "Users" : "Posts"}
                    icon={faLayerGroup}
                  />
                  <HeaderMetric
                    label="Kayit"
                    value={activeTotal}
                    icon={faChartSimple}
                  />
                </div>
              </div>

              {!isAdmin ? (
                <Card>
                  <CardContent className="space-y-3 p-6">
                    <Badge>Yetki siniri</Badge>
                    <h2 className="font-serif text-3xl text-(--ink)">Sadece izleme oturumu</h2>
                    <p className="text-sm leading-6 text-(--ink-muted)">
                      Bu hesap giris yapti ancak `users` ve `posts` operasyonlari
                      sadece admin kullanicilar icin acik.
                    </p>
                  </CardContent>
                </Card>
              ) : admin.activeAdminTab === "users" ? (
                <UsersPanel
                  users={admin.users}
                  sortOptions={admin.constants.userSortOptions}
                />
              ) : (
                <PostsPanel
                  posts={admin.posts}
                  sortOptions={admin.constants.postSortOptions}
                  authorOptionsLength={admin.authorOptions.length}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <UserSheet
        open={admin.users.drawerOpen}
        onClose={admin.users.closeDrawer}
        error={admin.users.error}
        isEditing={admin.users.isEditing}
        editingId={admin.users.editingId}
        loading={admin.users.loading}
        form={admin.users.form}
        editForm={admin.users.editForm}
      />
      <UserFiltersSheet
        open={admin.users.filterDrawerOpen}
        onClose={admin.users.closeFilterDrawer}
        loading={admin.users.loading}
        clearDisabled={admin.users.clearDisabled}
        searchInput={admin.users.filters.searchInput}
        setSearchInput={admin.users.filters.setSearchInput}
        sort={admin.users.sort}
        setSort={admin.users.setSort}
        limit={admin.users.limit}
        setLimit={admin.users.setLimit}
        submit={admin.users.filters.submit}
        clear={admin.users.filters.clear}
        sortOptions={admin.constants.userSortOptions}
        limitOptions={admin.constants.limitOptions}
      />
      <PostSheet
        open={admin.posts.drawerOpen}
        onClose={admin.posts.closeDrawer}
        error={admin.posts.error}
        isEditing={admin.posts.isEditing}
        editingId={admin.posts.editingId}
        loading={admin.posts.loading}
        authorOptions={admin.authorOptions}
        form={admin.posts.form}
        editForm={admin.posts.editForm}
      />
      <PostFiltersSheet
        open={admin.posts.filterDrawerOpen}
        onClose={admin.posts.closeFilterDrawer}
        loading={admin.posts.loading}
        clearDisabled={admin.posts.clearDisabled}
        searchInput={admin.posts.filters.searchInput}
        setSearchInput={admin.posts.filters.setSearchInput}
        sort={admin.posts.sort}
        setSort={admin.posts.setSort}
        limit={admin.posts.limit}
        setLimit={admin.posts.setLimit}
        publishedFilter={admin.posts.publishedFilter}
        setPublishedFilter={admin.posts.setPublishedFilter}
        authorFilter={admin.posts.authorFilter}
        setAuthorFilter={admin.posts.setAuthorFilter}
        submit={admin.posts.filters.submit}
        clear={admin.posts.filters.clear}
        sortOptions={admin.constants.postSortOptions}
        limitOptions={admin.constants.limitOptions}
        authorOptions={admin.authorOptions}
      />
    </main>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)">
          {title}
        </p>
      </div>
      {children}
    </section>
  );
}

function SidebarNavButton({
  active,
  icon,
  label,
  meta,
  description,
  onClick,
}: {
  active: boolean;
  icon: IconDefinition;
  label: string;
  meta: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-[20px] border p-3 text-left transition",
        active
          ? "border-[var(--line-strong)] bg-[var(--panel-soft)]"
          : "border-[var(--line)] bg-[var(--panel-deep)] hover:border-[var(--line-strong)] hover:bg-[var(--panel)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--panel)]">
          <FontAwesomeIcon icon={icon} className="h-4 w-4 text-[var(--accent)]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-(--ink)">{label}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--ink-muted)">
              {meta}
            </span>
          </span>
          <span className="mt-1 block text-xs leading-5 text-(--ink-muted)">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}

function SidebarLinkCard({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: IconDefinition;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-[20px] border border-[var(--line)] bg-[var(--panel-deep)] p-3 transition hover:border-[var(--line-strong)] hover:bg-[var(--panel)]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--panel)]">
        <FontAwesomeIcon icon={icon} className="h-4 w-4 text-[var(--accent)]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-(--ink)">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-(--ink-muted)">
          {description}
        </span>
      </span>
    </Link>
  );
}

function SessionStat({
  icon,
  label,
  value,
}: {
  icon: IconDefinition;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-[var(--line)] bg-[var(--panel-deep)] p-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--panel)]">
        <FontAwesomeIcon icon={icon} className="h-4 w-4 text-[var(--accent)]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold text-(--ink)">
          {value}
        </span>
      </span>
    </div>
  );
}

function CompactStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: IconDefinition;
}) {
  return (
    <article className="rounded-[20px] border border-[var(--line)] bg-[var(--panel-deep)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)">
          {label}
        </span>
        <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-[var(--accent)]" />
      </div>
      <p className="mt-2 text-sm font-semibold text-(--ink)">{value}</p>
    </article>
  );
}

function RecentActivityCard({
  icon,
  title,
  value,
  meta,
}: {
  icon: IconDefinition;
  title: string;
  value: string;
  meta: string;
}) {
  return (
    <article className="rounded-[20px] border border-[var(--line)] bg-[var(--panel-deep)] p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--panel)]">
          <FontAwesomeIcon icon={icon} className="h-4 w-4 text-[var(--accent)]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)">
            {title}
          </p>
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-(--ink)">{value}</p>
          <p className="mt-1 text-xs text-(--ink-muted)">{meta}</p>
        </div>
      </div>
    </article>
  );
}

function HeaderMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: IconDefinition;
}) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel-deep)] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)">
          {label}
        </span>
        <FontAwesomeIcon icon={icon} className="h-4 w-4 text-[var(--accent)]" />
      </div>
      <p className="mt-3 text-lg font-semibold text-(--ink)">{value}</p>
    </article>
  );
}
