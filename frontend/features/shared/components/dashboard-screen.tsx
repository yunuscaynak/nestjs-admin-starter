import {
  faArrowRightFromBracket,
  faFileLines,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostFiltersSheet } from "@/features/posts/components/post-filters-sheet";
import { PostSheet } from "@/features/posts/components/post-sheet";
import { PostsPanel } from "@/features/posts/components/posts-panel";
import { UserFiltersSheet } from "@/features/users/components/user-filters-sheet";
import { UserSheet } from "@/features/users/components/user-sheet";
import { UsersPanel } from "@/features/users/components/users-panel";
import { IconLabel } from "../lib/icon-label";
import type { AdminController } from "../lib/use-admin-controller";
import { getFullName } from "../lib/helpers";
import type { UserRecord } from "@/features/users/types";

type DashboardScreenProps = {
  currentUser: UserRecord;
  onLogout: () => Promise<void>;
  admin: AdminController;
};

export function DashboardScreen({
  currentUser,
  onLogout,
  admin,
}: DashboardScreenProps) {
  const isAdmin = currentUser.role === "ADMIN";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(0,173,181,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(57,62,70,0.22),transparent_28%),linear-gradient(180deg,#222831_0%,#393E46_100%)] px-4 py-6 md:px-8 md:py-8">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(238,238,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(238,238,238,0.04)_1px,transparent_1px)] bg-size-[40px_40px] opacity-70" />
      <section className="relative mx-auto grid max-w-7xl gap-6">
        <Card className="overflow-hidden border-(--line) bg-[linear-gradient(135deg,rgba(57,62,70,0.92),rgba(34,40,49,0.84))]">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
            <div className="space-y-3">
              <Badge>Aktif Oturum</Badge>
              <h1 className="font-serif text-4xl text-(--ink)ext-6xl">
                {getFullName(currentUser)}
              </h1>
              <p className="max-w-3xl text-sm text-(--ink-muted) md:text-base">
                {currentUser.email} · Rol: <strong>{currentUser.role}</strong>
              </p>
            </div>
            <Button variant="outline" onClick={() => void onLogout()}>
              <IconLabel icon={faArrowRightFromBracket}>Cikis Yap</IconLabel>
            </Button>
          </CardContent>
        </Card>

        {!isAdmin ? (
          <Card className="bg-[rgba(57,62,70,0.86)]">
            <CardContent className="space-y-3 p-6">
              <Badge>Yetki siniri</Badge>
              <h2 className="font-serif text-3xl text-(--ink)">Sadece izleme oturumu</h2>
              <p className="text-sm leading-6 text-(--ink-muted)">
                Bu hesap giris yapti ancak `users` ve `posts` operasyonlari
                sadece admin kullanicilar icin acik.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[rgba(57,62,70,0.72)] p-3">
            <CardContent className="space-y-5 p-0">
              <TabsList className="grid-cols-2">
                <TabsTrigger
                  active={admin.activeAdminTab === "users"}
                  onClick={() => admin.setActiveAdminTab("users")}
                >
                  <IconLabel icon={faUsers}>Kullanicilar</IconLabel>
                </TabsTrigger>
                <TabsTrigger
                  active={admin.activeAdminTab === "posts"}
                  onClick={() => admin.setActiveAdminTab("posts")}
                >
                  <IconLabel icon={faFileLines}>Postlar</IconLabel>
                </TabsTrigger>
              </TabsList>

              {admin.activeAdminTab === "users" ? (
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
        )}
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
