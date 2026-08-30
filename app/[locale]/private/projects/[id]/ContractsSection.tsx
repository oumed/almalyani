"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addContract, updateContractStatus, type ContractActionState } from "./contract-actions";

const STATUS_ORDER = ["draft", "active", "completed", "terminated"] as const;

type Dict = {
  contractsSection: {
    title: string;
    tableProfessional: string;
    tableAmount: string;
    tableStatus: string;
    proposalLabel: string;
    amountLabel: string;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    noProposals: string;
  };
};

export type ContractRow = {
  id: string;
  professionalName: string;
  totalAmount: number;
  status: string;
};

const initialState: ContractActionState = {};

export function ContractsSection({
  locale,
  dict,
  projectId,
  contracts,
  proposals,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  contracts: ContractRow[];
  proposals: { id: string; label: string }[];
}) {
  const t = dict.contractsSection;
  const boundAdd = addContract.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {contracts.length === 0 ? (
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
              {contracts.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-foreground">{c.professionalName}</td>
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {c.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {t.statuses[c.status as (typeof STATUS_ORDER)[number]] ?? c.status}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <form
                      action={updateContractStatus.bind(null, c.id, projectId, locale)}
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

      {proposals.length === 0 ? (
        <p className="text-sm text-muted">{t.noProposals}</p>
      ) : (
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="locale" value={locale} />
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.proposalLabel}
            <select
              name="proposalId"
              required
              className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            >
              {proposals.map((p) => (
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
              name="totalAmount"
              min={0}
              dir="ltr"
              className="w-32 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
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
