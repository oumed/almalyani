"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addPayment, updatePaymentStatus, type PaymentActionState } from "./payment-actions";

const STATUS_ORDER = ["pending", "completed", "failed", "refunded"] as const;
const TYPE_ORDER = ["contract_fee", "tax", "other"] as const;
const METHOD_ORDER = ["bank_transfer", "cash", "check"] as const;

type Dict = {
  paymentsSection: {
    title: string;
    tableTarget: string;
    tableAmount: string;
    tableType: string;
    tableStatus: string;
    targetLabel: string;
    amountLabel: string;
    typeLabel: string;
    types: Record<(typeof TYPE_ORDER)[number], string>;
    methodLabel: string;
    methods: Record<(typeof METHOD_ORDER)[number], string>;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    noTargets: string;
  };
};

export type PaymentRow = {
  id: string;
  targetLabel: string;
  amount: number;
  paymentType: string;
  status: string;
};

const initialState: PaymentActionState = {};

export function PaymentsSection({
  locale,
  dict,
  projectId,
  payments,
  targets,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  payments: PaymentRow[];
  targets: { value: string; label: string }[];
}) {
  const t = dict.paymentsSection;
  const boundAdd = addPayment.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {payments.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableTarget}</th>
                <th className="px-3 py-2 text-start">{t.tableAmount}</th>
                <th className="px-3 py-2 text-start">{t.tableType}</th>
                <th className="px-3 py-2 text-start">{t.tableStatus}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-foreground">{p.targetLabel}</td>
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {p.amount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {t.types[p.paymentType as (typeof TYPE_ORDER)[number]] ?? p.paymentType}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {t.statuses[p.status as (typeof STATUS_ORDER)[number]] ?? p.status}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <form
                      action={updatePaymentStatus.bind(null, p.id, projectId, locale)}
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

      {targets.length === 0 ? (
        <p className="text-sm text-muted">{t.noTargets}</p>
      ) : (
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="locale" value={locale} />
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.targetLabel}
            <select
              name="target"
              required
              className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            >
              {targets.map((tg) => (
                <option key={tg.value} value={tg.value}>
                  {tg.label}
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
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.typeLabel}
            <select
              name="paymentType"
              defaultValue="contract_fee"
              className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            >
              {TYPE_ORDER.map((ty) => (
                <option key={ty} value={ty}>
                  {t.types[ty]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.methodLabel}
            <select
              name="method"
              defaultValue="bank_transfer"
              className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            >
              {METHOD_ORDER.map((m) => (
                <option key={m} value={m}>
                  {t.methods[m]}
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
      )}
    </section>
  );
}
