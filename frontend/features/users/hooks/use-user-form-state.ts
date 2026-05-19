"use client";

import { useState } from "react";
import type {
  CreateUserFormValues,
  EditUserFormValues,
  Role,
  UserRecord,
} from "@/features/users/types";

const INITIAL_CREATE_FORM: CreateUserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "USER",
  showPassword: false,
};

const INITIAL_EDIT_FORM: EditUserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "USER",
  showPassword: false,
};

export function useUserFormState() {
  const [createForm, setCreateForm] = useState<CreateUserFormValues>(
    INITIAL_CREATE_FORM,
  );
  const [editForm, setEditForm] = useState<EditUserFormValues>(INITIAL_EDIT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetCreateForm() {
    setCreateForm(INITIAL_CREATE_FORM);
  }

  function resetEditForm() {
    setEditingId(null);
    setEditForm(INITIAL_EDIT_FORM);
  }

  function beginEdit(user: UserRecord) {
    setEditingId(user.id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      role: user.role,
      showPassword: false,
    });
  }

  return {
    editingId,
    createForm,
    editForm,
    resetCreateForm,
    resetEditForm,
    beginEdit,
    setCreateFirstName: (value: string) =>
      setCreateForm((current) => ({ ...current, firstName: value })),
    setCreateLastName: (value: string) =>
      setCreateForm((current) => ({ ...current, lastName: value })),
    setCreateEmail: (value: string) =>
      setCreateForm((current) => ({ ...current, email: value })),
    setCreatePassword: (value: string) =>
      setCreateForm((current) => ({ ...current, password: value })),
    setCreateRole: (value: Role) =>
      setCreateForm((current) => ({ ...current, role: value })),
    toggleCreatePassword: () =>
      setCreateForm((current) => ({
        ...current,
        showPassword: !current.showPassword,
      })),
    setEditFirstName: (value: string) =>
      setEditForm((current) => ({ ...current, firstName: value })),
    setEditLastName: (value: string) =>
      setEditForm((current) => ({ ...current, lastName: value })),
    setEditEmail: (value: string) =>
      setEditForm((current) => ({ ...current, email: value })),
    setEditPassword: (value: string) =>
      setEditForm((current) => ({ ...current, password: value })),
    setEditRole: (value: Role) =>
      setEditForm((current) => ({ ...current, role: value })),
    toggleEditPassword: () =>
      setEditForm((current) => ({
        ...current,
        showPassword: !current.showPassword,
      })),
  };
}
