"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { UserFormState } from "./actions";

const initialState: UserFormState = {};

type Dict = {
  usersAdmin: {
    emailLabel: string;
    passwordLabel: string;
    passwordEditHint: string;
    firstNameLabel: string;
    lastNameLabel: string;
    phoneLabel: string;
    cinLabel: string;
    roleLabel: string;
    statusLabel: string;
    roles: { client: string; professional: string; admin: string };
    statuses: { pending: string; active: string; suspended: string; banned: string };
    saveButton: string;
    savingButton: string;
    createButton: string;
    creatingButton: string;
    back: string;
  };
};

export type UserFormValues = {
  email: string;
  userType: string;
  status: string;
  firstName: string;
  lastName: string;
  phone: string;
  cin: string;
};

export function UserForm({
  locale,
  dict,
  action,
  mode,
  initialValues,
}: {
  locale: Locale;
  dict: Dict;
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  mode: "create" | "edit";
  initialValues?: UserFormValues;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const t = dict.usersAdmin;

  return (
    <form action={formAction} className="flex w-full max-w-lg flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <label className="flex flex-col gap-2 text-start text-sm text-muted">
        {t.emailLabel}
        <input
          type="text"
          name="email"
          required
          defaultValue={initialValues?.email}
          className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-2 text-start text-sm text-muted">
        {t.passwordLabel}
        <input
          type="password"
          name="password"
          required={mode === "create"}
          autoComplete="new-password"
          placeholder={mode === "edit" ? t.passwordEditHint : undefined}
          className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.firstNameLabel}
          <input
            type="text"
            name="firstName"
            required
            minLength={2}
            defaultValue={initialValues?.firstName}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.lastNameLabel}
          <input
            type="text"
            name="lastName"
            required
            minLength={2}
            defaultValue={initialValues?.lastName}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.phoneLabel}
          <input
            type="text"
            name="phone"
            required
            pattern="[0-9]{10}"
            title="10 digits"
            dir="ltr"
            defaultValue={initialValues?.phone}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.cinLabel}
          <input
            type="text"
            name="cin"
            required
            pattern="[A-Za-z]{1,2}[0-9]{5,6}"
            dir="ltr"
            defaultValue={initialValues?.cin}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.roleLabel}
          <select
            name="userType"
            required
            defaultValue={initialValues?.userType ?? "client"}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          >
            <option value="client">{t.roles.client}</option>
            <option value="professional">{t.roles.professional}</option>
            <option value="admin">{t.roles.admin}</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.statusLabel}
          <select
            name="status"
            required
            defaultValue={initialValues?.status ?? "active"}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          >
            <option value="pending">{t.statuses.pending}</option>
            <option value="active">{t.statuses.active}</option>
            <option value="suspended">{t.statuses.suspended}</option>
            <option value="banned">{t.statuses.banned}</option>
          </select>
        </label>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
        >
          {pending
            ? mode === "create"
              ? t.creatingButton
              : t.savingButton
            : mode === "create"
              ? t.createButton
              : t.saveButton}
        </button>
        <Link href={`/${locale}/private/users`} className="text-sm text-muted underline underline-offset-4 hover:text-foreground">
          {t.back}
        </Link>
      </div>
    </form>
  );
}
