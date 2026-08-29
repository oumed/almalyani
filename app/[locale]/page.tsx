import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, isLocale, localeNames, locales } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="geometric-field pointer-events-none absolute inset-0" aria-hidden="true" />

      <nav
        aria-label="Language"
        className="absolute top-6 flex items-center gap-3 text-xs font-medium text-muted"
      >
        {locales.map((l, i) => (
          <span key={l} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden="true">·</span>}
            {l === locale ? (
              <span className="text-accent" aria-current="page">
                {localeNames[l]}
              </span>
            ) : (
              <Link href={`/${l}`} className="hover:text-foreground">
                {localeNames[l]}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="relative flex max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1
            className="font-[family-name:var(--font-serif)] text-3xl font-medium tracking-[0.15em] text-foreground uppercase sm:text-4xl"
            dir="ltr"
          >
            {dict.brand}
          </h1>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
            {dict.title}
          </p>
        </div>

        <p className="font-[family-name:var(--font-serif)] text-lg italic text-accent">
          {dict.tagline}
        </p>

        <div className="flex items-center gap-4" aria-hidden="true">
          <span className="h-px w-12 bg-line" />
          <span className="h-2 w-2 rotate-45 border border-accent" />
          <span className="h-px w-12 bg-line" />
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium uppercase tracking-[0.1em] text-foreground">
          {dict.services.map((service, i) => (
            <li key={service} className="flex items-center gap-3">
              {i > 0 && <span className="text-accent" aria-hidden="true">·</span>}
              {service}
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-2 text-base text-muted">
          <p dir="ltr">{dict.addressLine1}</p>
          <p dir="ltr">{dict.addressLine2}</p>
          <p dir="ltr">
            {dict.phoneLandline} <span aria-hidden="true">·</span> {dict.phoneMobile}
          </p>
          <a href={`mailto:${dict.email}`} className="hover:text-foreground" dir="ltr">
            {dict.email}
          </a>
        </div>
      </div>

      <div className="relative mt-20 flex flex-col items-center gap-2">
        <p className="text-xs text-muted" dir="ltr">
          {dict.copyright}
        </p>
        <Link
          href={`/${locale}/private-login`}
          className="text-xs text-muted underline underline-offset-4 hover:text-foreground"
        >
          {dict.teamLogin}
        </Link>
      </div>
    </main>
  );
}
