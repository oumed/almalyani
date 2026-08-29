"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addPhase, updatePhaseStatus, type PhaseActionState } from "./phase-actions";

const STATUS_ORDER = ["not_started", "active", "completed"] as const;

type Dict = {
  projectPhases: {
    title: string;
    tableOrder: string;
    tableName: string;
    tableStatus: string;
    tableProgress: string;
    addPhaseTitle: string;
    nameLabel: string;
    orderLabel: string;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
  };
};

export type PhaseRow = {
  id: string;
  displayOrder: number;
  status: string;
  name: string;
  progressPct: number;
};

const initialState: PhaseActionState = {};

export function PhasesSection({
  locale,
  dict,
  projectId,
  phases,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  phases: PhaseRow[];
}) {
  const t = dict.projectPhases;
  const boundAdd = addPhase.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {phases.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableOrder}</th>
                <th className="px-3 py-2 text-start">{t.tableName}</th>
                <th className="px-3 py-2 text-start">{t.tableStatus}</th>
                <th className="px-3 py-2 text-start">{t.tableProgress}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {phases.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {p.displayOrder}
                  </td>
                  <td className="px-3 py-2 text-foreground">{p.name}</td>
                  <td className="px-3 py-2 text-muted">
                    {t.statuses[p.status as (typeof STATUS_ORDER)[number]] ?? p.status}
                  </td>
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {p.progressPct}%
                  </td>
                  <td className="px-3 py-2 text-end">
                    <form
                      action={updatePhaseStatus.bind(null, p.id, projectId, locale)}
                      className="flex items-center justify-end gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={p.status}
                        className="rounded border border-line bg-transparent px-2 py-1 text-xs text-foreground outline-none focus:border-accent"
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>
                            {t.statuses[s]}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-accent underline underline-offset-4 hover:text-foreground">
                        {t.updateButton}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="locale" value={locale} />
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.nameLabel}
          <input
            type="text"
            name="name"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.orderLabel}
          <input
            type="number"
            name="displayOrder"
            defaultValue={phases.length}
            dir="ltr"
            className="w-20 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.statusLabel}
          <select
            name="status"
            defaultValue="not_started"
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
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
