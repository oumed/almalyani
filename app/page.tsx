export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="geometric-field pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative flex max-w-2xl flex-col items-center gap-10">
        <p className="font-[family-name:var(--font-serif)] text-2xl font-medium tracking-[0.3em] text-accent uppercase">
          Almalyani
        </p>

        <div className="flex flex-col gap-5">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl font-medium leading-tight text-foreground sm:text-5xl">
            The Future of Moroccan Architecture Starts Here.
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            A modern platform designed to simplify and improve the daily work
            of Moroccan architects.
          </p>
        </div>

        <div className="flex items-center gap-4" aria-hidden="true">
          <span className="h-px w-12 bg-line" />
          <span className="h-2 w-2 rotate-45 border border-accent" />
          <span className="h-px w-12 bg-line" />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            Website Under Construction
          </h2>
          <p className="text-base text-muted">
            We&rsquo;re currently building something new for architects
            across Morocco.
          </p>
        </div>
      </div>

      <p className="relative mt-20 text-xs text-muted">
        &copy; 2026 Almalyani
      </p>
    </main>
  );
}
