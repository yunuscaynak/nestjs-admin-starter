"use client";

import { useState } from "react";
import { POST_SORT_OPTIONS } from "@/features/posts/constants";
import { usePostsController } from "@/features/posts/hooks/use-posts-controller";
import { USER_SORT_OPTIONS } from "@/features/users/constants";
import { useUsersController } from "@/features/users/hooks/use-users-controller";
import type { HttpClient } from "../services/http-client";
import { LIMIT_OPTIONS } from "./constants";

export function useAdminController({
  isAdmin,
  sessionToken,
  apiClient,
}: {
  isAdmin: boolean;
  sessionToken: string | null;
  apiClient: HttpClient;
}) {
  const [activeAdminTab, setActiveAdminTab] = useState<"users" | "posts">(
    "users",
  );

  const users = useUsersController({
    isAdmin,
    sessionToken,
    apiClient,
  });

  const posts = usePostsController({
    isAdmin,
    sessionToken,
    apiClient,
    authorOptions: users.authorOptions,
  });

  return {
    constants: {
      limitOptions: LIMIT_OPTIONS,
      userSortOptions: USER_SORT_OPTIONS,
      postSortOptions: POST_SORT_OPTIONS,
    },
    activeAdminTab,
    setActiveAdminTab,
    users,
    posts,
    authorOptions: users.authorOptions,
  };
}

export type AdminController = ReturnType<typeof useAdminController>;
