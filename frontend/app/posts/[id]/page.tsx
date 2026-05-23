import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPostDetail } from "@/features/posts/components/public-post-detail";
import { getPublicPost } from "@/features/posts/lib/public-posts";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublicPost(id);

  if (!post) {
    return {
      title: "Post bulunamadi | Nest CRUD",
    };
  }

  return {
    title: `${post.title} | Nest CRUD`,
    description: post.content.slice(0, 140),
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = await getPublicPost(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(0,173,181,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(57,62,70,0.24),transparent_26%),linear-gradient(180deg,#1D232B_0%,#222831_52%,#393E46_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(238,238,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(238,238,238,0.04)_1px,transparent_1px)] bg-size-[40px_40px] opacity-60" />
      <div className="relative">
        <PublicPostDetail post={post} />
      </div>
    </main>
  );
}
