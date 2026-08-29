"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addClarification, updateClarificationStatus, type ClarificationActionState } from "./clarification-actions";

const STATUS_ORDER = ["open", "answered", "closed"] as const;
const PRIORITY_ORDER = ["low", "medium", "high"] as const;

type Dict = {
  projectClarifications: {
    title: string;
    tableQuestion: string;
    tablePriority: string;
    tableStatus: string;
    questionLabel: string;
    priorityLabel: string;
    priorities: Record<(typeof PRIORITY_ORDER)[number], string>;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
  };
};

export type ClarificationRow = {
  id: string;
  question: string;
  priority: string;
  status: string;
};

const initialState: ClarificationActionState = {};

export function ClarificationsSection({
  locale,
  dict,
  projectId,
  clarifications,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  clarifications: ClarificationRow[];
}) {
  const t = dict.projectClarifications;
  const boundAdd = addClarification.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {clarifications.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableQuestion}</th>
                <th className="px-3 py-2 text-start">{t.tablePriority}</th>
                <th className="px-3 py-2 text-start">{t.tableStatus}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {clarifications.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-foreground">{c.question}</td>
                  <td className="px-3 py-2 text-muted">
                    {t.priorities[c.priority as (typeof PRIORITY_ORDER)[number]] ?? c.priority}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {t.statuses[c.status as (typeof STATUS_ORDER)[number]] ?? c.status}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <form
                      action={updateClarificationStatus.bind(null, c.id, projectId, locale)}
                      className="flex items-center justify-end gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={c.status}
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
        <label className="flex flex-1 min-w-[16rem] flex-col gap-1 text-xs text-muted">
          {t.questionLabel}
          <input
            type="text"
            name="question"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.priorityLabel}
          <select
            name="priority"
            defaultValue="medium"
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {t.priorities[p]}
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
