"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { ProjectFormState } from "./actions";

const initialState: ProjectFormState = {};

type StatusKey =
  | "draft"
  | "topo_needed"
  | "sketching"
  | "client_review"
  | "rokhas_submitted"
  | "rokhas_rejected"
  | "taxes_pending"
  | "permit_issued"
  | "construction"
  | "occupancy_pending"
  | "closed";

const STATUS_ORDER: StatusKey[] = [
  "draft",
  "topo_needed",
  "sketching",
  "client_review",
  "rokhas_submitted",
  "rokhas_rejected",
  "taxes_pending",
  "permit_issued",
  "construction",
  "occupancy_pending",
  "closed",
];

type Dict = {
  projectsAdmin: {
    titleLabel: string;
    clientLabel: string;
    descriptionLabel: string;
    cadastralLabel: string;
    landSurfaceLabel: string;
    builtSurfaceLabel: string;
    budgetMinLabel: string;
    budgetMaxLabel: string;
    statusLabel: string;
    statuses: Record<StatusKey, string>;
    saveButton: string;
    savingButton: string;
    createButton: string;
    creatingButton: string;
    back: string;
  };
};

export type ProjectFormValues = {
  clientId: string;
  status: string;
  title: string;
  description: string;
  cadastralNumber: string;
  landSurface: string;
  builtSurface: string;
  budgetMin: string;
  budgetMax: string;
};

export function ProjectForm({
  locale,
  dict,
  action,
  mode,
  clients,
  initialValues,
}: {
  locale: Locale;
  dict: Dict;
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  mode: "create" | "edit";
  clients: { id: string; label: string }[];
  initialValues?: ProjectFormValues;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const t = dict.projectsAdmin;

  return (
    <form action={formAction} className="flex w-full max-w-lg flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <label className="flex flex-col gap-2 text-start text-sm text-muted">
        {t.titleLabel}
        <input
          type="text"
          name="title"
          required
          defaultValue={initialValues?.title}
          className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-2 text-start text-sm text-muted">
        {t.clientLabel}
        <select
          name="clientId"
          required
          defaultValue={initialValues?.clientId}
          className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
        >
          {!initialValues?.clientId && <option value="" disabled />}
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-start text-sm text-muted">
        {t.descriptionLabel}
        <textarea
          name="description"
          rows={3}
          defaultValue={initialValues?.description}
          className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-2 text-start text-sm text-muted">
        {t.cadastralLabel}
        <input
          type="text"
          name="cadastralNumber"
          dir="ltr"
          defaultValue={initialValues?.cadastralNumber}
          className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.landSurfaceLabel}
          <input
            type="number"
            name="landSurface"
            min={0}
            step="1"
            dir="ltr"
            defaultValue={initialValues?.landSurface}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.builtSurfaceLabel}
          <input
            type="number"
            name="builtSurface"
            min={0}
            step="1"
            dir="ltr"
            defaultValue={initialValues?.builtSurface}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.budgetMinLabel}
          <input
            type="number"
            name="budgetMin"
            min={0}
            step="1"
            dir="ltr"
            defaultValue={initialValues?.budgetMin}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-2 text-start text-sm text-muted">
          {t.budgetMaxLabel}
          <input
            type="number"
            name="budgetMax"
            min={0}
            step="1"
            dir="ltr"
            defaultValue={initialValues?.budgetMax}
            className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-start text-sm text-muted">
        {t.statusLabel}
        <select
          name="status"
          required
          defaultValue={initialValues?.status ?? "draft"}
          className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {t.statuses[s]}
            </option>
          ))}
        </select>
      </label>

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
        <Link
          href={`/${locale}/private/projects`}
          className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
        >
          {t.back}
        </Link>
      </div>
    </form>
  );
}
