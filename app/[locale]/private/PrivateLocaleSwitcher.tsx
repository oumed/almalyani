"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";

export function PrivateLocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <nav aria-label="Language" className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true">·</span>}
          {l === locale ? (
            <span className="text-accent" aria-current="page">
              {localeNames[l]}
            </span>
          ) : (
            <Link href={`/${l}/${rest}`} className="hover:text-foreground">
              {localeNames[l]}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
