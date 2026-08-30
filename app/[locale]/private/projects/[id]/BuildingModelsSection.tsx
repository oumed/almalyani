"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addBuildingModel, type ModelActionState } from "./model-actions";

type Dict = {
  buildingModelsSection: {
    title: string;
    tableSoftware: string;
    tableIfc: string;
    tableState: string;
    softwareLabel: string;
    ifcVersionLabel: string;
    fileUrlLabel: string;
    stateLabel: string;
    addButton: string;
    addingButton: string;
    empty: string;
  };
};

export type BuildingModelRow = {
  id: string;
  softwareUsed: string;
  ifcVersion: string;
  modelState: string;
};

const initialState: ModelActionState = {};

export function BuildingModelsSection({
  locale,
  dict,
  projectId,
  models,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  models: BuildingModelRow[];
}) {
  const t = dict.buildingModelsSection;
  const boundAdd = addBuildingModel.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {models.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableSoftware}</th>
                <th className="px-3 py-2 text-start">{t.tableIfc}</th>
                <th className="px-3 py-2 text-start">{t.tableState}</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-foreground">{m.softwareUsed || "—"}</td>
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {m.ifcVersion || "—"}
                  </td>
                  <td className="px-3 py-2 text-muted">{m.modelState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="locale" value={locale} />
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.softwareLabel}
          <input
            type="text"
            name="softwareUsed"
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.ifcVersionLabel}
          <input
            type="text"
            name="ifcVersion"
            dir="ltr"
            className="w-28 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-1 min-w-[14rem] flex-col gap-1 text-xs text-muted">
          {t.fileUrlLabel}
          <input
            type="url"
            name="fileUrl"
            dir="ltr"
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.stateLabel}
          <input
            type="text"
            name="modelState"
            defaultValue="WIP"
            className="w-28 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
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
          {pending ? t.addingButton : t.addButton}
        </button>
      </form>
    </section>
  );
}
