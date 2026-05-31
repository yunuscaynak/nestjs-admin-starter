import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PostRecord } from "@/features/posts/types";
import { formatPublicPostDate } from "../lib/public-posts";

type PublicPostDetailProps = {
  post: PostRecord;
};

export function PublicPostDetail({ post }: PublicPostDetailProps) {
  const paragraphs = post.content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/posts"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-(--line) bg-[var(--panel-deep)] px-5 text-sm font-semibold text-(--ink) transition hover:bg-[var(--panel-soft)]"
        >
          Tum yazilara don
        </Link>
        <Badge>Yayinlanmis post</Badge>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="space-y-10 p-8 md:p-12">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-(--ink-muted)">
              <span>{formatPublicPostDate(post.createdAt)}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
              <span>
                {post.author.firstName} {post.author.lastName}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[rgba(238,238,238,0.3)]" />
              <span>{post.author.email}</span>
            </div>
            <h1 className="max-w-4xl font-serif text-5xl leading-none text-(--ink) md:text-7xl">
              {post.title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-(--ink-muted) md:text-base">
              Bu detay sayfasi public yuzeyde yalnizca yayinlanmis icerikleri
              gosterir. Admin panelindeki taslaklar burada aciga cikmaz.
            </p>
          </header>

          <article className="max-w-none text-base leading-8 text-(--ink-muted)">
            {paragraphs.map((paragraph, index) => (
              <p key={`${post.id}-${index}`} className="mb-5 last:mb-0">
                {paragraph}
              </p>
            ))}
          </article>
        </CardContent>
      </Card>
    </section>
  );
}
