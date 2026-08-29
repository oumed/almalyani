"use client";

import { MapPin, Phone, Mail, Download } from "lucide-react";
import { dictionaries, type Locale } from "@/lib/i18n";

const VCARD = `BEGIN:VCARD
VERSION:3.0
N:Meliani;Abdelkrim;;;
FN:Abdelkrim Meliani
ORG:Cabinet d'Architecture Abdelkrim Meliani
TITLE:Architecte D.P.L.G
TEL;TYPE=WORK,VOICE:+212535652557
TEL;TYPE=CELL,VOICE:+212661202354
EMAIL;TYPE=WORK:architecte.meliani@gmail.com
ADR;TYPE=WORK:;;70, Av Hassan II (Cinéma Empire);Fès;;;Morocco
NOTE:Conception • Études • Permis de construire
END:VCARD`;

function downloadVCard() {
  const blob = new Blob([VCARD], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Abdelkrim_Meliani.vcf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function Contact({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];
  const mapsQuery = encodeURIComponent(
    `${dict.contactCard.addressLine1} ${dict.contactCard.addressLine2}, Fès, Morocco`
  );

  return (
    <section id="contact" className="px-4 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {dict.contactSection.tag}
        </p>
        <h2 className="mb-3 font-[family-name:var(--font-serif)] text-3xl font-medium text-foreground sm:text-4xl">
          {dict.contactSection.title}
        </h2>
        <p className="mb-12 text-base text-muted">{dict.contactSection.subtitle}</p>

        <div className="mx-auto flex max-w-md flex-col gap-5 rounded-lg border border-line bg-background p-8 text-left">
          <div className="flex items-start gap-3" dir="ltr">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">{dict.contactSection.addressLabel}</p>
              <p className="text-sm text-foreground">
                {dict.contactCard.addressLine1} {dict.contactCard.addressLine2}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3" dir="ltr">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">{dict.contactSection.phoneLabel}</p>
              <p className="text-sm text-foreground">
                {dict.contactCard.phoneLandline} · {dict.contactCard.phoneMobile}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3" dir="ltr">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">{dict.contactSection.emailLabel}</p>
              <a href={`mailto:${dict.contactCard.email}`} className="text-sm text-foreground hover:text-accent">
                {dict.contactCard.email}
              </a>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 border-t border-line pt-5">
            <a
              href="tel:0535652557"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-foreground px-4 py-2.5 text-xs font-medium text-background hover:bg-accent"
            >
              <Phone className="h-3.5 w-3.5" />
              {dict.contactSection.callNow}
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-line px-4 py-2.5 text-xs font-medium text-foreground hover:bg-line/30"
            >
              <MapPin className="h-3.5 w-3.5" />
              {dict.contactSection.openInMaps}
            </a>
            <button
              type="button"
              onClick={downloadVCard}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-line px-4 py-2.5 text-xs font-medium text-foreground hover:bg-line/30"
            >
              <Download className="h-3.5 w-3.5" />
              {dict.contactSection.downloadVCard}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
