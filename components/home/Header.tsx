"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, Mail } from "lucide-react";
import { localeNames, locales, type Locale } from "@/lib/i18n";
import { dictionaries } from "@/lib/i18n";
import { BrandMonogram } from "./BrandMonogram";

export function Header({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: dict.nav.home, href: "#home" },
    { label: dict.nav.services, href: "#services" },
    { label: dict.nav.philosophy, href: "#philosophy" },
    { label: dict.nav.contact, href: "#contact" },
  ];

  return (
    <>
      <div className="border-b border-line bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-8">
          <span className="hidden items-center gap-1.5 opacity-80 sm:flex" dir="ltr">
            {dict.contactCard.addressLine1}
          </span>
          <div className="flex items-center gap-4 font-medium" dir="ltr">
            <a href="tel:0535652557" className="inline-flex items-center gap-1.5 hover:text-accent">
              <Phone className="h-3.5 w-3.5" />
              {dict.contactCard.phoneLandline}
            </a>
            <a
              href="mailto:architecte.meliani@gmail.com"
              className="hidden items-center gap-1.5 hover:text-accent lg:inline-flex"
            >
              <Mail className="h-3.5 w-3.5" />
              {dict.contactCard.email}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <a href="#home" className="flex items-center gap-3">
            <BrandMonogram size={40} />
            <span className="font-[family-name:var(--font-serif)] text-base font-medium tracking-wide text-foreground uppercase" dir="ltr">
              {dict.brand}
            </span>
          </a>

          <nav aria-label="Sections" className="hidden items-center gap-6 text-sm font-medium text-foreground lg:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-accent">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <nav aria-label="Language" className="hidden items-center gap-2 text-xs font-medium text-muted sm:flex">
              {locales.map((l, i) => (
                <span key={l} className="flex items-center gap-2">
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

            <a
              href="#contact"
              className="hidden rounded-sm border border-accent/40 bg-foreground px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-accent sm:inline-flex"
            >
              {dict.nav.consultBtn}
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md p-2 text-foreground hover:bg-line/40 lg:hidden"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-background px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded px-3 py-2 text-base font-medium text-foreground hover:bg-line/40"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex items-center gap-3 border-t border-line px-3 pt-3 text-xs font-medium text-muted">
                {locales.map((l, i) => (
                  <span key={l} className="flex items-center gap-3">
                    {i > 0 && <span aria-hidden="true">·</span>}
                    {l === locale ? (
                      <span className="text-accent">{localeNames[l]}</span>
                    ) : (
                      <Link href={`/${l}`} onClick={() => setMenuOpen(false)}>
                        {localeNames[l]}
                      </Link>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
