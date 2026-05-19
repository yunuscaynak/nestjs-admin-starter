import {
  faArrowLeft,
  faArrowRight,
  faFileLines,
  faPen,
  faPlus,
  faSliders,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconLabel } from "@/features/shared/lib/icon-label";
import { formatDate, getFullName } from "@/features/shared/lib/helpers";
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
    openDrawer: () => void;
    openFilterDrawer: () => void;
    beginEdit: (post: PostRecord) => void;
    deletePost: (id: string) => Promise<void>;
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
  return (
    <Card className="bg-[rgba(57,62,70,0.86)]">
      <CardContent className="p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge>Posts</Badge>
            <h2 className="font-serif text-3xl text-[var(--ink)]">Post Yonetimi</h2>
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
          <p className="mb-4 rounded-2xl border border-[rgba(166,41,41,0.15)] bg-[rgba(166,41,41,0.08)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
            {posts.error}
          </p>
        ) : null}

        <div className="grid gap-4">
          {!posts.loading && posts.items.length === 0 ? (
            <p className="rounded-[24px] border border-dashed border-[var(--line)] bg-[rgba(34,40,49,0.6)] px-5 py-8 text-center text-sm text-[var(--ink-muted)]">
              Bu filtrelere uygun post yok.
            </p>
          ) : null}

          {posts.items.map((post) => (
            <article
              key={post.id}
              className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-[rgba(34,40,49,0.7)] p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-[var(--ink)]">
                    {post.title}
                  </h3>
                  <p className="max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">
                    {post.content}
                  </p>
                </div>
                <div className="grid gap-3 text-sm text-[var(--ink-muted)] md:justify-items-end">
                  <Badge className="border-[rgba(0,173,181,0.18)] bg-[rgba(0,173,181,0.12)] text-[var(--accent)]">
                    {post.published ? "YAYINDA" : "TASLAK"}
                  </Badge>
                  <span>#{post.id.slice(0, 8)}</span>
                  <time>{formatDate(post.createdAt)}</time>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="inline-flex items-center gap-3 text-sm text-[var(--ink-muted)]">
                  <FontAwesomeIcon icon={faFileLines} className="h-4 w-4" />
                  <span>
                    {getFullName(post.author)} · {post.author.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => posts.beginEdit(post)}>
                    <IconLabel icon={faPen}>Duzenle</IconLabel>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void posts.deletePost(post.id)}
                  >
                    <IconLabel icon={faTrash}>Sil</IconLabel>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-[var(--line)] pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge>{posts.loading ? "Yukleniyor..." : `${posts.total} post`}</Badge>
            <Badge>
              Siralama: {sortOptions.find((option) => option.value === posts.sort)?.label ?? posts.sort}
            </Badge>
            <Badge>{posts.limit} / sayfa</Badge>
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
            <span className="text-sm font-medium text-[var(--ink-muted)]">
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
  );
}
