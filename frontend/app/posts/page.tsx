import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PublicPostList } from "@/features/posts/components/public-post-list";
import { listPublicPosts } from "@/features/posts/lib/public-posts";

export const metadata: Metadata = {
  title: "Public Posts | Nest CRUD",
  description: "Yayinlanmis postlarin herkese acik listeleme sayfasi.",
};

type PostsPageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = normalizePage(resolvedSearchParams.page);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const posts = await listPublicPosts({
    page,
    q: query || undefined,
  });

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div>
        <div className="mx-auto flex w-full max-w-7xl justify-between gap-3 px-4 pt-6 md:px-8">
          <Badge>Content Surface</Badge>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-deep)] px-5 text-sm font-semibold text-(--ink) transition hover:bg-[var(--panel-soft)]"
          >
            Admin girisi
          </Link>
        </div>
        <PublicPostList posts={posts} query={query} />
      </div>
    </main>
  );
}

function normalizePage(rawPage?: string) {
  const parsedPage = Number(rawPage);

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return Math.floor(parsedPage);
}
