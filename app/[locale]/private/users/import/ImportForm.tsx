"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { importUsers, type ImportState } from "./actions";

const initialState: ImportState = {};

type Dict = {
  usersImport: {
    instructions: string;
    columns: string;
    fileLabel: string;
    importButton: string;
    importingButton: string;
    back: string;
    resultCreated: string;
    resultFailed: string;
    errorRow: string;
  };
};

export function ImportForm({ locale, dict }: { locale: Locale; dict: Dict }) {
  const t = dict.usersImport;
  const [state, formAction, pending] = useActionState(importUsers, initialState);

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <div className="rounded-lg border border-line bg-line/10 p-4 text-sm text-muted">
        <p className="mb-2">{t.instructions}</p>
        <code className="block break-words rounded bg-background px-2 py-1.5 text-xs text-foreground" dir="ltr">
          {t.columns}
        </code>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <label className="flex flex-col gap-2 text-sm text-muted">
          {t.fileLabel}
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="rounded border border-line bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        {state.error && (
          <p role="alert" className="text-sm text-accent">
            {state.error}
          </p>
        )}

        {state.created !== undefined && (
          <div className="flex flex-col gap-2 rounded-lg border border-line p-4 text-sm">
            <p className="text-foreground">
              {state.created} {t.resultCreated}
              {state.failed && state.failed.length > 0 ? `, ${state.failed.length} ${t.resultFailed}` : ""}
            </p>
            {state.failed && state.failed.length > 0 && (
              <ul className="flex flex-col gap-1 text-xs text-accent">
                {state.failed.map((f) => (
                  <li key={f.row}>
                    {t.errorRow} {f.row}: {f.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {pending ? t.importingButton : t.importButton}
          </button>
          <Link href={`/${locale}/private/users`} className="text-sm text-muted underline underline-offset-4 hover:text-foreground">
            {t.back}
          </Link>
        </div>
      </form>
    </div>
  );
}
