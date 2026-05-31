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
    <main className="min-h-screen bg-[var(--background)]">
      <div>
        <PublicPostDetail post={post} />
      </div>
    </main>
  );
}
