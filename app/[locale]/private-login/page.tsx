"use client";

import { useActionState } from "react";
import { authenticate, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function PrivateLoginPage() {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <main
      className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center"
      dir="ltr"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <p className="font-[family-name:var(--font-serif)] text-2xl font-medium tracking-[0.3em] text-accent uppercase">
          Almalyani
        </p>

        <div className="flex w-full flex-col gap-2">
          <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            Private Area
          </h1>
          <p className="text-sm text-muted">Enter the password to continue.</p>
        </div>

        <form action={formAction} className="flex w-full flex-col gap-4">
          <label className="flex flex-col gap-2 text-left text-sm text-muted">
            Password
            <input
              type="password"
              name="password"
              required
              autoFocus
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
            {pending ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
