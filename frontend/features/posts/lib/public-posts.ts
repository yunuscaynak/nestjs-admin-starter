import "server-only";

import { getApiBaseUrl } from "@/features/shared/services/http-config";
import type { PostRecord, PostsResponse } from "@/features/posts/types";

type PublicPostsQuery = {
  page?: number;
  limit?: number;
  q?: string;
};

type ApiErrorBody = {
  message?: string | string[];
};

const DEFAULT_PAGE_SIZE = 9;

function buildPublicPostsUrl(path: string, query?: PublicPostsQuery) {
  const url = new URL(path.replace(/^\/+/, ""), `${getApiBaseUrl()}/`);

  if (query?.page) {
    url.searchParams.set("page", String(query.page));
  }

  if (query?.limit) {
    url.searchParams.set("limit", String(query.limit));
  }

  if (query?.q?.trim()) {
    url.searchParams.set("q", query.q.trim());
  }

  return url.toString();
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorBody;

    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }

    if (body.message) {
      return body.message;
    }
  } catch {
    // Ignore parse issues and fall back to status text.
  }

  return response.statusText || "Istek basarisiz oldu.";
}

export async function listPublicPosts(query?: PublicPostsQuery) {
  const response = await fetch(buildPublicPostsUrl("/posts/public", {
    page: query?.page ?? 1,
    limit: query?.limit ?? DEFAULT_PAGE_SIZE,
    q: query?.q,
  }), {
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as PostsResponse;
}

export async function getPublicPost(id: string) {
  const response = await fetch(buildPublicPostsUrl(`/posts/public/${id}`), {
    next: {
      revalidate: 60,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as PostRecord;
}

export function getPostExcerpt(content: string, maxLength = 180) {
  const normalizedContent = content.replace(/\s+/g, " ").trim();

  if (normalizedContent.length <= maxLength) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, maxLength).trimEnd()}...`;
}

export function formatPublicPostDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}
