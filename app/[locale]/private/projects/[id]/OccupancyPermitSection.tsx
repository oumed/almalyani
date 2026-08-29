"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { saveOccupancyPermit, type PermitActionState } from "./permit-actions";

const STATUS_ORDER = [
  "not_requested",
  "inspection_scheduled",
  "compliance_ok",
  "issued",
  "rejected",
] as const;

type Dict = {
  occupancyPermitSection: {
    title: string;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    notesLabel: string;
    certificateUrlLabel: string;
    saveButton: string;
    savingButton: string;
  };
};

export type OccupancyPermitValues = {
  status: string;
  inspectionNotes: string;
  certificateUrl: string;
};

const initialState: PermitActionState = {};

export function OccupancyPermitSection({
  locale,
  dict,
  projectId,
  values,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  values: OccupancyPermitValues;
}) {
  const t = dict.occupancyPermitSection;
  const boundAction = saveOccupancyPermit.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <section className="flex w-full flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.statusLabel}
          <select
            name="status"
            defaultValue={values.status}
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {t.statuses[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 min-w-[16rem] flex-col gap-1 text-xs text-muted">
          {t.notesLabel}
          <input
            type="text"
            name="inspectionNotes"
            defaultValue={values.inspectionNotes}
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-1 min-w-[16rem] flex-col gap-1 text-xs text-muted">
          {t.certificateUrlLabel}
          <input
            type="url"
            name="certificateUrl"
            dir="ltr"
            defaultValue={values.certificateUrl}
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        {state.error && (
          <p role="alert" className="text-sm text-accent">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50"
        >
          {pending ? t.savingButton : t.saveButton}
        </button>
      </form>
    </section>
  );
}
