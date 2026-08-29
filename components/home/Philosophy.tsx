import { Sun, Layers, Wind } from "lucide-react";
import { dictionaries, type Locale } from "@/lib/i18n";

const icons = [Sun, Layers, Wind];

export function Philosophy({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];

  return (
    <section id="philosophy" className="bg-foreground px-4 py-16 text-background sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            {dict.philosophySection.tag}
          </p>
          <h2 className="font-[family-name:var(--font-serif)] text-3xl font-medium sm:text-4xl">
            {dict.philosophySection.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {dict.philosophySection.pillars.map((pillar, idx) => {
            const Icon = icons[idx];
            return (
              <div key={pillar.title} className="rounded-lg border border-background/15 p-6 sm:p-7">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-accent/30 bg-background/10 text-accent">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mb-3 font-[family-name:var(--font-serif)] text-lg font-medium">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-background/70">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
