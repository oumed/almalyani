"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addApproval, updateApprovalStatus, type ApprovalActionState } from "./approval-actions";

const STATUS_ORDER = ["submitted", "under_review", "approved", "rejected", "revised"] as const;

type Dict = {
  projectApprovals: {
    title: string;
    tableTitle: string;
    tableStatus: string;
    titleLabel: string;
    descriptionLabel: string;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
  };
};

export type ApprovalRow = {
  id: string;
  title: string;
  status: string;
};

const initialState: ApprovalActionState = {};

export function ApprovalsSection({
  locale,
  dict,
  projectId,
  approvals,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  approvals: ApprovalRow[];
}) {
  const t = dict.projectApprovals;
  const boundAdd = addApproval.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {approvals.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableTitle}</th>
                <th className="px-3 py-2 text-start">{t.tableStatus}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {approvals.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-foreground">{a.title}</td>
                  <td className="px-3 py-2 text-muted">
                    {t.statuses[a.status as (typeof STATUS_ORDER)[number]] ?? a.status}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <form
                      action={updateApprovalStatus.bind(null, a.id, projectId, locale)}
                      className="flex items-center justify-end gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={a.status}
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
        <label className="flex flex-1 min-w-[12rem] flex-col gap-1 text-xs text-muted">
          {t.titleLabel}
          <input
            type="text"
            name="title"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-1 min-w-[16rem] flex-col gap-1 text-xs text-muted">
          {t.descriptionLabel}
          <input
            type="text"
            name="description"
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
          {pending ? t.addingButton : t.addButton}
        </button>
      </form>
    </section>
  );
}
