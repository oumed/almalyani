"use client";

import { useState } from "react";
import { PenTool, FileText, ShieldCheck, HardHat, Check } from "lucide-react";
import { dictionaries, type Locale } from "@/lib/i18n";

const icons = [PenTool, FileText, ShieldCheck, HardHat];

export function Services({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];
  const [selected, setSelected] = useState(0);
  const services = dict.servicesSection.list;
  const active = services[selected];

  return (
    <section id="services" className="px-4 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            {dict.servicesSection.tag}
          </p>
          <h2 className="mb-3 font-[family-name:var(--font-serif)] text-3xl font-medium text-foreground sm:text-4xl">
            {dict.servicesSection.title}
          </h2>
          <p className="text-base text-muted">{dict.servicesSection.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-5">
            {services.map((service, idx) => {
              const Icon = icons[idx];
              const isActive = idx === selected;
              return (
                <button
                  key={service.number}
                  type="button"
                  onClick={() => setSelected(idx)}
                  className={`flex items-start gap-4 rounded-lg border p-5 text-left transition-colors ${
                    isActive
                      ? "border-accent bg-foreground text-background"
                      : "border-line bg-background text-foreground hover:border-accent/50"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                      isActive ? "bg-accent text-foreground" : "bg-line/40 text-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="mb-1 block text-xs tracking-wide opacity-70">{service.number}</span>
                    <span className="block text-sm font-semibold">{service.title}</span>
                    <span className={`mt-1 block text-xs ${isActive ? "text-background/75" : "text-muted"}`}>
                      {service.shortDesc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-line bg-background p-6 sm:p-8 lg:col-span-7">
            <h3 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-medium text-foreground">
              {active.title}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-muted">{active.fullDesc}</p>
            <ul className="flex flex-col gap-2.5">
              {active.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
