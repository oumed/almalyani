import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { dictionaries, type Locale } from "@/lib/i18n";
import { BrandMonogram } from "./BrandMonogram";

export function Footer({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];

  const navLinks = [
    { label: dict.nav.home, href: "#home" },
    { label: dict.nav.services, href: "#services" },
    { label: dict.nav.philosophy, href: "#philosophy" },
    { label: dict.nav.contact, href: "#contact" },
  ];

  return (
    <footer className="border-t border-line bg-foreground px-4 pt-14 pb-8 text-background sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 border-b border-background/15 pb-10 sm:grid-cols-3">
          <div className="flex flex-col items-start gap-3 sm:col-span-1">
            <div className="flex items-center gap-3">
              <BrandMonogram size={40} />
              <span className="font-[family-name:var(--font-serif)] text-base font-medium" dir="ltr">
                {dict.brand}
              </span>
            </div>
            <p className="text-xs text-background/60 uppercase tracking-wide">{dict.title}</p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              {dict.footer.navHeading}
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-background/75">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-accent">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              {dict.contactSection.tag}
            </h4>
            <div className="flex flex-col gap-2 text-sm text-background/75" dir="ltr">
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                {dict.contactCard.addressLine1} {dict.contactCard.addressLine2}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-accent" />
                {dict.contactCard.phoneLandline} / {dict.contactCard.phoneMobile}
              </span>
              <a href={`mailto:${dict.contactCard.email}`} className="flex items-center gap-2 hover:text-accent">
                <Mail className="h-3.5 w-3.5 shrink-0 text-accent" />
                {dict.contactCard.email}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pt-6 text-xs text-background/60 sm:flex-row sm:justify-between">
          <p dir="ltr">{dict.footer.copyright}</p>
          <p>{dict.footer.tagline}</p>
          <Link href={`/${locale}/private-login`} className="underline underline-offset-4 hover:text-background">
            {dict.teamLogin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
