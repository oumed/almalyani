"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addModelComponent, type ModelActionState } from "./model-actions";

type Dict = {
  modelComponentsSection: {
    title: string;
    tableModel: string;
    tableElementType: string;
    tableMaterial: string;
    tableVolume: string;
    modelLabel: string;
    globalIdLabel: string;
    elementTypeLabel: string;
    materialLabel: string;
    volumeLabel: string;
    areaLabel: string;
    addButton: string;
    addingButton: string;
    empty: string;
    noModels: string;
  };
};

export type ModelComponentRow = {
  id: string;
  modelLabel: string;
  elementType: string;
  material: string;
  volume: number;
};

const initialState: ModelActionState = {};

export function ModelComponentsSection({
  locale,
  dict,
  projectId,
  components,
  models,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  components: ModelComponentRow[];
  models: { id: string; label: string }[];
}) {
  const t = dict.modelComponentsSection;
  const boundAdd = addModelComponent.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {components.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableModel}</th>
                <th className="px-3 py-2 text-start">{t.tableElementType}</th>
                <th className="px-3 py-2 text-start">{t.tableMaterial}</th>
                <th className="px-3 py-2 text-start">{t.tableVolume}</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-muted">{c.modelLabel}</td>
                  <td className="px-3 py-2 text-foreground">{c.elementType}</td>
                  <td className="px-3 py-2 text-muted">{c.material || "—"}</td>
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {c.volume}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {models.length === 0 ? (
        <p className="text-sm text-muted">{t.noModels}</p>
      ) : (
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="locale" value={locale} />
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.modelLabel}
            <select
              name="buildingModelId"
              required
              className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.globalIdLabel}
            <input
              type="text"
              name="globalId"
              dir="ltr"
              className="w-32 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.elementTypeLabel}
            <input
              type="text"
              name="elementType"
              required
              className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.materialLabel}
            <input
              type="text"
              name="material"
              className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.volumeLabel}
            <input
              type="number"
              name="volume"
              min={0}
              dir="ltr"
              className="w-24 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.areaLabel}
            <input
              type="number"
              name="area"
              min={0}
              dir="ltr"
              className="w-24 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
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
      )}
    </section>
  );
}
