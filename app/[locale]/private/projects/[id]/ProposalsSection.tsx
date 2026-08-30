"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addProposal, updateProposalStatus, type ProposalActionState } from "./proposal-actions";

const STATUS_ORDER = ["draft", "submitted", "under_review", "accepted", "rejected", "withdrawn"] as const;

type Dict = {
  proposalsSection: {
    title: string;
    tableProfessional: string;
    tableAmount: string;
    tableStatus: string;
    professionalLabel: string;
    amountLabel: string;
    textLabel: string;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
  };
};

export type ProposalRow = {
  id: string;
  professionalName: string;
  amount: number;
  status: string;
};

const initialState: ProposalActionState = {};

export function ProposalsSection({
  locale,
  dict,
  projectId,
  proposals,
  professionals,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  proposals: ProposalRow[];
  professionals: { id: string; label: string }[];
}) {
  const t = dict.proposalsSection;
  const boundAdd = addProposal.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {proposals.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableProfessional}</th>
                <th className="px-3 py-2 text-start">{t.tableAmount}</th>
                <th className="px-3 py-2 text-start">{t.tableStatus}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-foreground">{p.professionalName}</td>
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {p.amount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {t.statuses[p.status as (typeof STATUS_ORDER)[number]] ?? p.status}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <form
                      action={updateProposalStatus.bind(null, p.id, projectId, locale)}
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
          {t.professionalLabel}
          <select
            name="professionalId"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.amountLabel}
          <input
            type="number"
            name="amount"
            min={0}
            dir="ltr"
            className="w-32 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-1 min-w-[14rem] flex-col gap-1 text-xs text-muted">
          {t.textLabel}
          <input
            type="text"
            name="proposalText"
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
          disabled={pending || professionals.length === 0}
          className="rounded bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50"
        >
          {pending ? t.addingButton : t.addButton}
        </button>
      </form>
    </section>
  );
}
