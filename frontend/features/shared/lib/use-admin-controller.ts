"use client";

import { useState } from "react";
import { usePostsController } from "@/features/posts/hooks/use-posts-controller";
import { useUsersController } from "@/features/users/hooks/use-users-controller";
import type { ApiClient } from "../services/api-client";
import {
  LIMIT_OPTIONS,
  POST_SORT_OPTIONS,
  USER_SORT_OPTIONS,
} from "./constants";

export function useAdminController({
  isAdmin,
  sessionToken,
  apiClient,
}: {
  isAdmin: boolean;
  sessionToken: string | null;
  apiClient: ApiClient;
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
