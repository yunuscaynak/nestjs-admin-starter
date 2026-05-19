"use client";

import type { ApiClient } from "@/features/shared/services/api-client";
import type {
  PostSortOption,
  PostsResponse,
} from "@/features/shared/lib/types";

type ListPostsParams = {
  page: number;
  limit: number;
  sort: PostSortOption;
  q?: string;
  authorId?: string;
  published?: "true" | "false";
};

type CreatePostPayload = {
  title: string;
  content: string;
  authorId: string;
  published: boolean;
};

type UpdatePostPayload = CreatePostPayload;

export function listPosts(apiClient: ApiClient, query: ListPostsParams) {
  return apiClient.get<PostsResponse>("/posts", {
    cache: "no-store",
    query,
  });
}

export function createPost(apiClient: ApiClient, payload: CreatePostPayload) {
  return apiClient.post("/posts", payload);
}

export function updatePost(
  apiClient: ApiClient,
  id: string,
  payload: UpdatePostPayload,
) {
  return apiClient.patch(`/posts/${id}`, payload);
}

export function deletePost(apiClient: ApiClient, id: string) {
  return apiClient.delete(`/posts/${id}`);
}
