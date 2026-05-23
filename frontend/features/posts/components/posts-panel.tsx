import {
  faArrowLeft,
  faArrowRight,
  faBan,
  faFileLines,
  faPen,
  faPlus,
  faSliders,
  faTrash,
  faTowerBroadcast,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IconLabel } from "@/features/shared/lib/icon-label";
import {
  formatDate,
  getFullName,
  getInitials,
} from "@/features/shared/lib/helpers";
import type { PostRecord, PostSortOption } from "@/features/posts/types";

type PostsPanelProps = {
  posts: {
    items: PostRecord[];
    error: string;
    loading: boolean;
    total: number;
    page: number;
    hasNextPage: boolean;
    limit: number;
    sort: PostSortOption;
    appliedQuery: string;
    publishedFilter: "all" | "true" | "false";
    publishingId: string | null;
    openDrawer: () => void;
    openFilterDrawer: () => void;
    beginEdit: (post: PostRecord) => void;
    deletePost: (id: string) => Promise<void>;
    togglePublish: (post: PostRecord) => Promise<void>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
  };
  sortOptions: Array<{ label: string; value: PostSortOption }>;
  authorOptionsLength: number;
};

export function PostsPanel({
  posts,
  sortOptions,
  authorOptionsLength,
}: PostsPanelProps) {
  const [activeReaderPost, setActiveReaderPost] = useState<PostRecord | null>(null);
  const activeSortLabel =
    sortOptions.find((option) => option.value === posts.sort)?.label ?? posts.sort;

  return (
    <>
      <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(57,62,70,0.92),rgba(34,40,49,0.9))]">
        <CardContent className="p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge>Posts</Badge>
            <h2 className="font-serif text-3xl text-(--ink)">Post Yonetimi</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={posts.openFilterDrawer}>
              <IconLabel icon={faSliders}>Filtreler</IconLabel>
            </Button>
            <Button onClick={posts.openDrawer} disabled={posts.loading || authorOptionsLength === 0}>
              <IconLabel icon={faPlus}>Yeni Post</IconLabel>
            </Button>
          </div>
        </div>

        {posts.error ? (
          <p className="mb-4 rounded-2xl border border-[rgba(166,41,41,0.15)] bg-[rgba(166,41,41,0.08)] px-4 py-3 text-sm font-medium text-(--danger)">
            {posts.error}
          </p>
        ) : null}

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[26px] border border-[rgba(0,173,181,0.18)] bg-[linear-gradient(135deg,rgba(0,173,181,0.16),rgba(34,40,49,0.5))] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-(--ink-muted)">
              Toplam post
            </p>
            <p className="mt-3 font-serif text-4xl text-(--ink)">
              {posts.loading ? "..." : posts.total}
            </p>
          </article>
          <article className="rounded-[26px] border border-(--line) bg-[rgba(34,40,49,0.64)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-(--ink-muted)">
              Sayfa
            </p>
            <p className="mt-3 font-serif text-3xl text-(--ink)">{posts.page}</p>
          </article>
          <article className="rounded-[26px] border border-(--line) bg-[rgba(34,40,49,0.64)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-(--ink-muted)">
              Siralama
            </p>
            <p className="mt-3 text-sm font-medium text-(--ink)">{activeSortLabel}</p>
          </article>
          <article className="rounded-[26px] border border-(--line) bg-[rgba(34,40,49,0.64)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-(--ink-muted)">
              Durum
            </p>
            <p className="mt-3 text-sm font-medium text-(--ink)">
              {posts.publishedFilter === "all"
                ? "Tum yayin durumlari"
                : posts.publishedFilter === "true"
                  ? "Sadece yayinda"
                  : "Sadece taslak"}
            </p>
          </article>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {!posts.loading && posts.items.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-(--line) bg-[rgba(34,40,49,0.6)] px-5 py-8 text-center text-sm text-(--ink-muted) md:col-span-2 2xl:col-span-3">
              Bu filtrelere uygun post yok.
            </p>
          ) : null}

          {posts.items.map((post) => {
            const isLongContent = post.content.trim().length > 220;

            return (
              <article
                key={post.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-[rgba(238,238,238,0.08)] bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_28%,rgba(34,40,49,0.96)_72%),radial-gradient(circle_at_top_left,rgba(0,173,181,0.16),transparent_34%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(0,173,181,0.34)]"
              >
                <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,173,181,0.9),transparent)] opacity-0 transition group-hover:opacity-100" />
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[rgba(0,173,181,0.12)] blur-2xl transition duration-300 group-hover:bg-[rgba(0,173,181,0.22)]" />

                <div className="relative space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-[rgba(0,173,181,0.18)] bg-[rgba(0,173,181,0.12)] text-(--accent)">
                        {post.published ? "YAYINDA" : "TASLAK"}
                      </Badge>
                    </div>
                    <Button
                      variant={post.published ? "secondary" : "default"}
                      size="sm"
                      className={post.published
                        ? "px-4 text-xs whitespace-nowrap border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)]"
                        : "px-4 text-xs whitespace-nowrap"}
                      disabled={posts.loading || posts.publishingId === post.id}
                      onClick={() => void posts.togglePublish(post)}
                    >
                      <IconLabel icon={faTowerBroadcast}>
                        {posts.publishingId === post.id
                          ? "Guncelleniyor"
                          : post.published
                            ? "Yayindan Kaldir"
                            : "Yayina Al"}
                      </IconLabel>
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-serif text-[34px] font-semibold leading-[0.98] tracking-[-0.02em] text-white md:text-[38px]">
                      {post.title}
                    </h3>
                    <p className="line-clamp-4 text-[15px] font-medium leading-7 text-[rgba(238,238,238,0.88)] md:text-base">
                      {post.content}
                    </p>
                    {isLongContent ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition hover:text-white"
                        onClick={() => setActiveReaderPost(post)}
                      >
                        Devamini Gor
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="relative mt-auto pt-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-(--ink-muted)">
                        Yazar
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,rgba(0,173,181,0.24),rgba(255,255,255,0.05))] font-serif text-sm text-(--ink)">
                          {getInitials(post.author)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-(--ink)">
                            {getFullName(post.author)}
                          </p>
                          <p className="truncate text-sm text-(--ink-muted)">
                            {post.author.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-(--ink-muted)">
                        Yayin zamani
                      </p>
                      <div className="mt-3 inline-flex items-center gap-3 text-sm text-(--ink)">
                        <FontAwesomeIcon icon={faFileLines} className="h-4 w-4 text-(--accent)" />
                        <time className="font-medium text-(--ink)">
                          {formatDate(post.createdAt)}
                        </time>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 flex flex-wrap gap-3 border-t border-[rgba(255,255,255,0.08)] pt-4">
                    <Button
                      variant="secondary"
                      className="min-w-35 flex-1 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)]"
                      disabled={posts.publishingId === post.id}
                      onClick={() => posts.beginEdit(post)}
                    >
                      <IconLabel icon={faPen}>Duzenle</IconLabel>
                    </Button>
                    <Button
                      variant="destructive"
                      className="min-w-35 flex-1 shadow-[0_14px_26px_rgba(166,41,41,0.22)]"
                      disabled={posts.publishingId === post.id}
                      onClick={() => void posts.deletePost(post.id)}
                    >
                      <IconLabel icon={faTrash}>Sil</IconLabel>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-(--line) pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {posts.appliedQuery ? <Badge>Arama: {posts.appliedQuery}</Badge> : null}
            {posts.publishedFilter !== "all" ? (
              <Badge>
                Durum: {posts.publishedFilter === "true" ? "Yayinda" : "Taslak"}
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                posts.setPage((previousPage) => Math.max(1, previousPage - 1))
              }
              disabled={posts.loading || posts.page === 1}
            >
              <IconLabel icon={faArrowLeft}>Onceki</IconLabel>
            </Button>
            <span className="text-sm font-medium text-(--ink-muted)">
              Sayfa {posts.page}
            </span>
            <Button
              onClick={() => posts.setPage((previousPage) => previousPage + 1)}
              disabled={posts.loading || !posts.hasNextPage}
            >
              <IconLabel icon={faArrowRight}>Sonraki</IconLabel>
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>

      <Sheet open={activeReaderPost !== null} onClose={() => setActiveReaderPost(null)}>
        {activeReaderPost ? (
          <>
            <SheetHeader>
              <div>
                <Badge className="mb-3 border-[rgba(0,173,181,0.18)] bg-[rgba(0,173,181,0.12)] text-(--accent)">
                  {activeReaderPost.published ? "YAYINDA" : "TASLAK"}
                </Badge>
                <SheetTitle className="text-(--ink)">{activeReaderPost.title}</SheetTitle>
                <SheetDescription>
                  {getFullName(activeReaderPost.author)} · {formatDate(activeReaderPost.createdAt)}
                </SheetDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActiveReaderPost(null)}>
                <FontAwesomeIcon icon={faBan} className="h-4 w-4" />
              </Button>
            </SheetHeader>

            <article className="space-y-5 text-base leading-8 text-[rgba(238,238,238,0.88)]">
              {activeReaderPost.content.split(/\n+/).map((paragraph, index) => (
                <p key={`${activeReaderPost.id}-${index}`}>
                  {paragraph}
                </p>
              ))}
            </article>
          </>
        ) : null}
      </Sheet>
    </>
  );
}
