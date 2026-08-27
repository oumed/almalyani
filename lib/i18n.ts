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
  privateTitle: string;
  privateSubtitle: string;
  passwordLabel: string;
  enterButton: string;
  checkingButton: string;
  errorIncorrect: string;
  errorNotConfigured: string;
  privateYoureIn: string;
  privateBody: string;
  logoutLabel: string;
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
    privateTitle: "Private Area",
    privateSubtitle: "Enter the password to continue.",
    passwordLabel: "Password",
    enterButton: "Enter",
    checkingButton: "Checking…",
    errorIncorrect: "Incorrect password.",
    errorNotConfigured: "The private area isn't configured yet.",
    privateYoureIn: "You're in",
    privateBody:
      "The private area is coming soon. This page confirms the gate works — real content lands here in a future phase.",
    logoutLabel: "Log out",
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
    privateTitle: "Espace privé",
    privateSubtitle: "Entrez le mot de passe pour continuer.",
    passwordLabel: "Mot de passe",
    enterButton: "Entrer",
    checkingButton: "Vérification…",
    errorIncorrect: "Mot de passe incorrect.",
    errorNotConfigured: "L'espace privé n'est pas encore configuré.",
    privateYoureIn: "Vous êtes connecté",
    privateBody:
      "L'espace privé arrive bientôt. Cette page confirme que l'accès fonctionne — le contenu réel sera ajouté dans une prochaine phase.",
    logoutLabel: "Se déconnecter",
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
    privateTitle: "المنطقة الخاصة",
    privateSubtitle: "أدخل كلمة المرور للمتابعة.",
    passwordLabel: "كلمة المرور",
    enterButton: "دخول",
    checkingButton: "جارٍ التحقق…",
    errorIncorrect: "كلمة المرور غير صحيحة.",
    errorNotConfigured: "المنطقة الخاصة غير مهيأة بعد.",
    privateYoureIn: "لقد دخلت",
    privateBody:
      "المنطقة الخاصة قادمة قريبًا. تؤكد هذه الصفحة أن الحماية تعمل — سيتم إضافة المحتوى الحقيقي في مرحلة قادمة.",
    logoutLabel: "تسجيل الخروج",
  },
};
