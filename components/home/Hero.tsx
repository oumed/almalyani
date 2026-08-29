import { MapPin, Phone, Mail } from "lucide-react";
import { dictionaries, type Locale } from "@/lib/i18n";
import { BrandMonogram } from "./BrandMonogram";

export function Hero({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];

  return (
    <section id="home" className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-24">
      <div className="geometric-field pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="flex flex-col items-start lg:col-span-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-background px-3.5 py-1.5 text-xs font-medium text-muted">
            {dict.hero.badge}
          </div>

          <p className="mb-3 font-[family-name:var(--font-serif)] text-lg italic text-accent">
            « {dict.tagline} »
          </p>

          <h1 className="mb-5 font-[family-name:var(--font-serif)] text-3xl leading-tight font-medium text-foreground sm:text-4xl lg:text-5xl">
            {dict.hero.titleStart} <span className="text-accent">{dict.hero.titleHighlight}</span>{" "}
            {dict.hero.titleEnd}
          </h1>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {dict.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-accent/40 bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-accent"
            >
              {dict.hero.exploreBtn}
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-line px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-line/30"
            >
              {dict.hero.contactBtn}
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-lg border border-line bg-foreground p-6 text-background shadow-lg sm:p-7">
            <div className="mb-5 flex items-center gap-3 border-b border-background/15 pb-5">
              <BrandMonogram size={44} />
              <div>
                <p className="font-[family-name:var(--font-serif)] text-lg font-medium" dir="ltr">
                  {dict.brand}
                </p>
                <p className="text-xs tracking-wide text-background/70 uppercase">{dict.title}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm text-background/85">
              <div className="flex items-start gap-2.5" dir="ltr">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  {dict.contactCard.addressLine1} {dict.contactCard.addressLine2}
                </span>
              </div>
              <div className="flex items-center gap-2.5" dir="ltr">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <span>
                  {dict.contactCard.phoneLandline} · {dict.contactCard.phoneMobile}
                </span>
              </div>
              <div className="flex items-center gap-2.5" dir="ltr">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${dict.contactCard.email}`} className="hover:text-accent">
                  {dict.contactCard.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
