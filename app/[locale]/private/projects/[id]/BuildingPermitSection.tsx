"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { saveBuildingPermit, type PermitActionState } from "./permit-actions";

const STATUS_ORDER = ["draft", "submitted", "rejected", "approved", "delivered"] as const;

type Dict = {
  buildingPermitSection: {
    title: string;
    rokhasRefLabel: string;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    civilTaxLabel: string;
    urbanTaxLabel: string;
    communeTaxLabel: string;
    totalTaxLabel: string;
    saveButton: string;
    savingButton: string;
  };
};

export type BuildingPermitValues = {
  rokhasReference: string;
  status: string;
  isCivilTaxPaid: boolean;
  isUrbanTaxPaid: boolean;
  isCommuneTaxPaid: boolean;
  totalTaxAmount: number;
};

const initialState: PermitActionState = {};

export function BuildingPermitSection({
  locale,
  dict,
  projectId,
  values,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  values: BuildingPermitValues;
}) {
  const t = dict.buildingPermitSection;
  const boundAction = saveBuildingPermit.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.rokhasRefLabel}
          <input
            type="text"
            name="rokhasReference"
            dir="ltr"
            defaultValue={values.rokhasReference}
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

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

        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.totalTaxLabel}
          <input
            type="number"
            name="totalTaxAmount"
            min={0}
            dir="ltr"
            defaultValue={values.totalTaxAmount}
            className="w-36 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="civilTaxPaid" defaultChecked={values.isCivilTaxPaid} />
            {t.civilTaxLabel}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="urbanTaxPaid" defaultChecked={values.isUrbanTaxPaid} />
            {t.urbanTaxLabel}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="communeTaxPaid" defaultChecked={values.isCommuneTaxPaid} />
            {t.communeTaxLabel}
          </label>
        </div>

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
