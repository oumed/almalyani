export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

export const rtlLocales: readonly Locale[] = ["ar"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

type Dictionary = {
  metaTitle: string;
  metaDescription: string;
  brand: string;
  headline: string;
  subtext: string;
  underConstruction: string;
  body: string;
  copyright: string;
  teamLogin: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    metaTitle: "Almalyani — The Future of Moroccan Architecture Starts Here",
    metaDescription:
      "A modern platform designed to simplify and improve the daily work of Moroccan architects. Website under construction.",
    brand: "Almalyani",
    headline: "The Future of Moroccan Architecture Starts Here.",
    subtext:
      "A modern platform designed to simplify and improve the daily work of Moroccan architects.",
    underConstruction: "Website Under Construction",
    body: "We're currently building something new for architects across Morocco.",
    copyright: "© 2026 Almalyani",
    teamLogin: "Team Login",
  },
  fr: {
    metaTitle: "Almalyani — L'avenir de l'architecture marocaine commence ici",
    metaDescription:
      "Une plateforme moderne conçue pour simplifier et améliorer le travail quotidien des architectes marocains. Site en construction.",
    brand: "Almalyani",
    headline: "L'avenir de l'architecture marocaine commence ici.",
    subtext:
      "Une plateforme moderne conçue pour simplifier et améliorer le travail quotidien des architectes marocains.",
    underConstruction: "Site en construction",
    body: "Nous construisons actuellement quelque chose de nouveau pour les architectes à travers le Maroc.",
    copyright: "© 2026 Almalyani",
    teamLogin: "Connexion équipe",
  },
  ar: {
    metaTitle: "ألمالياني — مستقبل الهندسة المعمارية المغربية يبدأ هنا",
    metaDescription:
      "منصة حديثة مصممة لتبسيط وتحسين العمل اليومي للمهندسين المعماريين المغاربة. الموقع قيد الإنشاء.",
    brand: "Almalyani",
    headline: "مستقبل الهندسة المعمارية المغربية يبدأ هنا.",
    subtext:
      "منصة حديثة مصممة لتبسيط وتحسين العمل اليومي للمهندسين المعماريين المغاربة.",
    underConstruction: "الموقع قيد الإنشاء",
    body: "نحن نعمل حاليًا على بناء شيء جديد للمهندسين المعماريين في جميع أنحاء المغرب.",
    copyright: "© 2026 Almalyani",
    teamLogin: "دخول الفريق",
  },
};
