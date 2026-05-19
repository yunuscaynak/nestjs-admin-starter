import type { PaginatedResponse } from "@/features/shared/lib/pagination";

export type PostRecord = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type PostsResponse = PaginatedResponse<PostRecord>;

export type PostSortOption =
  | "title:asc"
  | "title:desc"
  | "createdAt:asc"
  | "createdAt:desc"
  | "updatedAt:asc"
  | "updatedAt:desc";

export type ListPostsParams = {
  page: number;
  limit: number;
  sort: PostSortOption;
  q?: string;
  authorId?: string;
  published?: "true" | "false";
};

export type CreatePostPayload = {
  title: string;
  content: string;
  authorId: string;
  published: boolean;
};

export type UpdatePostPayload = CreatePostPayload;

export type CreatePostFormValues = {
  title: string;
  content: string;
  authorId: string;
  published: boolean;
};

export type EditPostFormValues = CreatePostFormValues;

export type PostFilterValues = {
  searchInput: string;
  appliedQuery: string;
  published: "all" | "true" | "false";
  authorId: string;
};
