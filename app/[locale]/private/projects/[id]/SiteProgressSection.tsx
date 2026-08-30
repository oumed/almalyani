"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addSiteProgressLog, type SiteProgressActionState } from "./site-progress-actions";

type Dict = {
  siteProgressSection: {
    title: string;
    tableDate: string;
    tableDescription: string;
    tableProgress: string;
    tableWeather: string;
    descriptionLabel: string;
    percentLabel: string;
    weatherLabel: string;
    workersLabel: string;
    addButton: string;
    addingButton: string;
    empty: string;
  };
};

export type SiteProgressRow = {
  id: string;
  logDate: string;
  description: string;
  percentComplete: number;
  weather: string;
};

const initialState: SiteProgressActionState = {};

export function SiteProgressSection({
  locale,
  dict,
  projectId,
  logs,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  logs: SiteProgressRow[];
}) {
  const t = dict.siteProgressSection;
  const boundAdd = addSiteProgressLog.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {logs.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableDate}</th>
                <th className="px-3 py-2 text-start">{t.tableDescription}</th>
                <th className="px-3 py-2 text-start">{t.tableProgress}</th>
                <th className="px-3 py-2 text-start">{t.tableWeather}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {l.logDate}
                  </td>
                  <td className="px-3 py-2 text-foreground">{l.description}</td>
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {l.percentComplete}%
                  </td>
                  <td className="px-3 py-2 text-muted">{l.weather || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="locale" value={locale} />
        <label className="flex flex-1 min-w-[14rem] flex-col gap-1 text-xs text-muted">
          {t.descriptionLabel}
          <input
            type="text"
            name="description"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.percentLabel}
          <input
            type="number"
            name="percentComplete"
            min={0}
            max={100}
            dir="ltr"
            className="w-24 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.weatherLabel}
          <input
            type="text"
            name="weather"
            className="w-28 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.workersLabel}
          <input
            type="number"
            name="workersCount"
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
    </section>
  );
}
