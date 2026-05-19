"use client";

import type { HttpClient } from "@/features/shared/services/http-client";
import type {
  CreatePostPayload,
  ListPostsParams,
  PostRecord,
  PostsResponse,
  UpdatePostPayload,
} from "@/features/posts/types";

export function listPosts(
  httpClient: HttpClient,
  query: ListPostsParams,
): Promise<PostsResponse> {
  return httpClient.get<PostsResponse>("/posts", {
    cache: "no-store",
    query,
  });
}

export function createPost(
  httpClient: HttpClient,
  payload: CreatePostPayload,
): Promise<PostRecord> {
  return httpClient.post<PostRecord>("/posts", payload);
}

export function updatePost(
  httpClient: HttpClient,
  id: string,
  payload: UpdatePostPayload,
): Promise<PostRecord> {
  return httpClient.patch<PostRecord>(`/posts/${id}`, payload);
}

export function deletePost(
  httpClient: HttpClient,
  id: string,
): Promise<PostRecord> {
  return httpClient.delete<PostRecord>(`/posts/${id}`);
}
