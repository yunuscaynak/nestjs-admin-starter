import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PostsResponse } from "@/features/posts/types";
import {
  formatPublicPostDate,
  getPostExcerpt,
} from "../lib/public-posts";

type PublicPostListProps = {
  posts: PostsResponse;
  query: string;
};

export function PublicPostList({ posts, query }: PublicPostListProps) {
  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 md:px-8 md:py-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Badge>Public Posts</Badge>
          <div className="space-y-2">
            <h1 className="max-w-4xl font-serif text-5xl leading-none text-(--ink) md:text-7xl">
              Yayinlanmis yazilarin herkese acik vitrini.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-(--ink-muted) md:text-base">
              Bu alan admin panelinden ayridir. Yalnizca yayinlanmis postlar
              gorunur; boylece operasyon arayuzu ile public icerik yuzeyi temiz
              bicimde ayrisir.
            </p>
          </div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(34,40,49,0.5)] px-5 py-4 text-sm text-(--ink-muted)">
          <p>{posts.meta.total} yazi yayinda</p>
          <p>
            Sayfa {posts.meta.page}
            {posts.meta.totalPages > 0 ? ` / ${posts.meta.totalPages}` : ""}
          </p>
        </div>
      </div>

      <form className="grid gap-3 rounded-[28px] border border-[var(--line)] bg-[rgba(34,40,49,0.55)] p-4 md:grid-cols-[1fr_auto]">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Baslik veya icerikte ara"
          className="h-12 rounded-full border border-[var(--line)] bg-[rgba(57,62,70,0.74)] px-5 text-sm text-(--ink) outline-none transition placeholder:text-[rgba(238,238,238,0.42)] focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)]"
        >
          Aramayi uygula
        </button>
      </form>

      {posts.items.length === 0 ? (
        <Card className="bg-[rgba(57,62,70,0.72)]">
          <CardContent className="space-y-3 p-8">
            <Badge>Sonuc yok</Badge>
            <h2 className="font-serif text-3xl text-(--ink)">
              Eslesen yayinlanmis post bulunamadi.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-(--ink-muted)">
              Arama terimini sadeleştirip tekrar deneyebilirsin veya admin
              panelinden yeni bir yaziyi published durumda yayinlayabilirsin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.items.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="group block">
              <Card className="h-full overflow-hidden bg-[linear-gradient(160deg,rgba(57,62,70,0.92),rgba(34,40,49,0.78))] transition duration-200 hover:-translate-y-1 hover:border-[rgba(0,173,181,0.42)]">
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge className="text-[rgba(238,238,238,0.82)]">
                      Yayinlandi
                    </Badge>
                    <p className="text-xs uppercase tracking-[0.16em] text-[rgba(238,238,238,0.45)]">
                      {formatPublicPostDate(post.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h2 className="font-serif text-3xl leading-tight text-(--ink) transition group-hover:text-white">
                      {post.title}
                    </h2>
                    <p className="text-sm leading-7 text-(--ink-muted)">
                      {getPostExcerpt(post.content)}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-[rgba(238,238,238,0.08)] pt-4">
                    <div>
                      <p className="text-sm font-semibold text-(--ink)">
                        {post.author.firstName} {post.author.lastName}
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-[rgba(238,238,238,0.45)]">
                        Author
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--accent)]">
                      Detayi ac
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {posts.meta.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--line)] bg-[rgba(34,40,49,0.48)] p-4">
          <Link
            href={buildPageHref(posts.meta.page - 1, query)}
            aria-disabled={posts.meta.page <= 1}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-5 text-sm font-semibold text-(--ink) transition hover:bg-[rgba(57,62,70,0.92)] aria-disabled:pointer-events-none aria-disabled:opacity-40"
          >
            Onceki sayfa
          </Link>
          <p className="text-sm text-(--ink-muted)">
            {posts.meta.total} kayit arasindan {posts.items.length} tanesi gosteriliyor
          </p>
          <Link
            href={buildPageHref(posts.meta.page + 1, query)}
            aria-disabled={
              posts.meta.totalPages === 0 || posts.meta.page >= posts.meta.totalPages
            }
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)] aria-disabled:pointer-events-none aria-disabled:opacity-40"
          >
            Sonraki sayfa
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function buildPageHref(page: number, query: string) {
  const normalizedPage = Math.max(1, page);
  const searchParams = new URLSearchParams();

  if (normalizedPage > 1) {
    searchParams.set("page", String(normalizedPage));
  }

  if (query.trim()) {
    searchParams.set("q", query.trim());
  }

  const serialized = searchParams.toString();
  return serialized ? `/posts?${serialized}` : "/posts";
}
