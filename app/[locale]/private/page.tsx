import { logout } from "../private-login/actions";

export default function PrivatePage() {
  return (
    <main
      className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center"
      dir="ltr"
    >
      <div className="flex max-w-xl flex-col items-center gap-8">
        <p className="font-[family-name:var(--font-serif)] text-2xl font-medium tracking-[0.3em] text-accent uppercase">
          Almalyani
        </p>

        <div className="flex flex-col gap-3">
          <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            You&rsquo;re in
          </h1>
          <p className="text-base text-muted">
            The private area is coming soon. This page confirms the gate
            works — real content lands here in a future phase.
          </p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
