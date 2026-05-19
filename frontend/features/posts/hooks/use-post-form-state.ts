"use client";

import { useState } from "react";
import type {
  CreatePostFormValues,
  EditPostFormValues,
  PostRecord,
} from "@/features/posts/types";

const INITIAL_CREATE_FORM: CreatePostFormValues = {
  title: "",
  content: "",
  authorId: "",
  published: false,
};

const INITIAL_EDIT_FORM: EditPostFormValues = {
  title: "",
  content: "",
  authorId: "",
  published: false,
};

export function usePostFormState(authorOptions: Array<{ id: string }>) {
  const [createForm, setCreateForm] = useState<CreatePostFormValues>(
    INITIAL_CREATE_FORM,
  );
  const [editForm, setEditForm] = useState<EditPostFormValues>(INITIAL_EDIT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetCreateForm() {
    setCreateForm({
      ...INITIAL_CREATE_FORM,
      authorId: createForm.authorId || authorOptions[0]?.id || "",
    });
  }

  function resetEditForm() {
    setEditingId(null);
    setEditForm(INITIAL_EDIT_FORM);
  }

  function beginEdit(post: PostRecord) {
    setEditingId(post.id);
    setEditForm({
      title: post.title,
      content: post.content,
      authorId: post.author.id,
      published: post.published,
    });
  }

  return {
    editingId,
    createForm,
    editForm,
    resetCreateForm,
    resetEditForm,
    beginEdit,
    setCreateTitle: (value: string) =>
      setCreateForm((current) => ({ ...current, title: value })),
    setCreateContent: (value: string) =>
      setCreateForm((current) => ({ ...current, content: value })),
    setCreateAuthorId: (value: string) =>
      setCreateForm((current) => ({ ...current, authorId: value })),
    setCreatePublished: (value: boolean) =>
      setCreateForm((current) => ({ ...current, published: value })),
    setEditTitle: (value: string) =>
      setEditForm((current) => ({ ...current, title: value })),
    setEditContent: (value: string) =>
      setEditForm((current) => ({ ...current, content: value })),
    setEditAuthorId: (value: string) =>
      setEditForm((current) => ({ ...current, authorId: value })),
    setEditPublished: (value: boolean) =>
      setEditForm((current) => ({ ...current, published: value })),
  };
}
