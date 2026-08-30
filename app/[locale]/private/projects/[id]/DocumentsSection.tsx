"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addDocument, updateDocumentStatus, type DocumentActionState } from "./document-actions";

const STATUS_ORDER = ["WIP", "Shared", "Published", "Archived"] as const;

type Dict = {
  projectDocumentsSection: {
    title: string;
    tableTitle: string;
    tableType: string;
    tableStatus: string;
    titleLabel: string;
    fileUrlLabel: string;
    typeLabel: string;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
  };
};

export type DocumentRow = {
  id: string;
  title: string;
  fileUrl: string;
  documentType: string;
  status: string;
};

const initialState: DocumentActionState = {};

export function DocumentsSection({
  locale,
  dict,
  projectId,
  documents,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  documents: DocumentRow[];
}) {
  const t = dict.projectDocumentsSection;
  const boundAdd = addDocument.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {documents.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableTitle}</th>
                <th className="px-3 py-2 text-start">{t.tableType}</th>
                <th className="px-3 py-2 text-start">{t.tableStatus}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {documents.map((docItem) => (
                <tr key={docItem.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-foreground">
                    {docItem.fileUrl ? (
                      <a
                        href={docItem.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                        dir="ltr"
                      >
                        {docItem.title}
                      </a>
                    ) : (
                      docItem.title
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted">{docItem.documentType || "—"}</td>
                  <td className="px-3 py-2 text-muted">
                    {t.statuses[docItem.status as (typeof STATUS_ORDER)[number]] ?? docItem.status}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <form
                      action={updateDocumentStatus.bind(null, docItem.id, projectId, locale)}
                      className="flex items-center justify-end gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={docItem.status}
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
          {t.titleLabel}
          <input
            type="text"
            name="title"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.fileUrlLabel}
          <input
            type="url"
            name="fileUrl"
            dir="ltr"
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.typeLabel}
          <input
            type="text"
            name="documentType"
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
