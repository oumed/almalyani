"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addDocumentVersion, type DocumentVersionActionState } from "./document-version-actions";

type Dict = {
  documentVersionsSection: {
    title: string;
    tableDocument: string;
    tableVersion: string;
    tableChange: string;
    documentLabel: string;
    versionLabel: string;
    fileUrlLabel: string;
    changeLabel: string;
    addButton: string;
    addingButton: string;
    empty: string;
    noDocuments: string;
  };
};

export type DocumentVersionRow = {
  id: string;
  documentTitle: string;
  versionNumber: string;
  changeDescription: string;
};

const initialState: DocumentVersionActionState = {};

export function DocumentVersionsSection({
  locale,
  dict,
  projectId,
  versions,
  documents,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  versions: DocumentVersionRow[];
  documents: { id: string; label: string }[];
}) {
  const t = dict.documentVersionsSection;
  const boundAdd = addDocumentVersion.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {versions.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableDocument}</th>
                <th className="px-3 py-2 text-start">{t.tableVersion}</th>
                <th className="px-3 py-2 text-start">{t.tableChange}</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-foreground">{v.documentTitle}</td>
                  <td className="px-3 py-2 text-muted" dir="ltr">
                    {v.versionNumber}
                  </td>
                  <td className="px-3 py-2 text-muted">{v.changeDescription || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {documents.length === 0 ? (
        <p className="text-sm text-muted">{t.noDocuments}</p>
      ) : (
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="locale" value={locale} />
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.documentLabel}
            <select
              name="documentId"
              required
              className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.versionLabel}
            <input
              type="text"
              name="versionNumber"
              defaultValue="V1"
              dir="ltr"
              className="w-20 rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-1 min-w-[12rem] flex-col gap-1 text-xs text-muted">
            {t.fileUrlLabel}
            <input
              type="url"
              name="fileUrl"
              dir="ltr"
              className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-1 min-w-[14rem] flex-col gap-1 text-xs text-muted">
            {t.changeLabel}
            <input
              type="text"
              name="changeDescription"
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
      )}
    </section>
  );
}
