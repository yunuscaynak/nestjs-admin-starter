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
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,173,181,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(57,62,70,0.24),transparent_26%),linear-gradient(180deg,#1D232B_0%,#222831_52%,#393E46_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(238,238,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(238,238,238,0.04)_1px,transparent_1px)] bg-size-[40px_40px] opacity-60" />
      <div className="relative">
        <div className="mx-auto flex w-full max-w-7xl justify-between gap-3 px-4 pt-6 md:px-8">
          <Badge className="bg-[rgba(34,40,49,0.5)]">Content Surface</Badge>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(34,40,49,0.48)] px-5 text-sm font-semibold text-(--ink) transition hover:bg-[rgba(57,62,70,0.92)]"
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
