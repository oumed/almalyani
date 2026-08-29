"use client";

import { useActionState } from "react";
import { authenticate, type LoginState } from "./actions";
import type { Locale } from "@/lib/i18n";

const initialState: LoginState = {};

type Dict = {
  brand: string;
  privateTitle: string;
  privateSubtitle: string;
  usernameLabel: string;
  passwordLabel: string;
  enterButton: string;
  checkingButton: string;
};

export default function PrivateLoginForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <p
          className="font-[family-name:var(--font-serif)] text-2xl font-medium tracking-[0.3em] text-accent uppercase"
          dir="ltr"
        >
          {dict.brand}
        </p>

        <div className="flex w-full flex-col gap-2">
          <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            {dict.privateTitle}
          </h1>
          <p className="text-sm text-muted">{dict.privateSubtitle}</p>
        </div>

        <form action={formAction} className="flex w-full flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="flex flex-col gap-2 text-start text-sm text-muted">
            {dict.usernameLabel}
            <input
              type="text"
              name="username"
              required
              autoFocus
              autoComplete="username"
              className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2 text-start text-sm text-muted">
            {dict.passwordLabel}
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded border border-line bg-transparent px-3 py-2 text-foreground outline-none focus:border-accent"
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
            className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
          >
            {pending ? dict.checkingButton : dict.enterButton}
          </button>
        </form>
      </div>
    </main>
  );
}
