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
  title: string;
  tagline: string;
  services: [string, string, string];
  addressLine1: string;
  addressLine2: string;
  phoneLandline: string;
  phoneMobile: string;
  email: string;
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
    metaTitle: "Abdelkrim Meliani — Architect D.P.L.G",
    metaDescription:
      "Architecture practice in Fès, Morocco — design, studies, and building permits.",
    brand: "Abdelkrim Meliani",
    title: "Architect D.P.L.G",
    tagline: "Designing today to inspire tomorrow",
    services: ["Design", "Studies", "Building Permits"],
    addressLine1: "70, Av Hassan II – Fès",
    addressLine2: "(Cinéma Empire)",
    phoneLandline: "05 35 65 25 57",
    phoneMobile: "06 61 20 23 54",
    email: "architecte.meliani@gmail.com",
    copyright: "© 2026 Abdelkrim Meliani",
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
    metaTitle: "Abdelkrim Meliani — Architecte D.P.L.G",
    metaDescription:
      "Cabinet d'architecture à Fès — conception, études et permis de construire.",
    brand: "Abdelkrim Meliani",
    title: "Architecte D.P.L.G",
    tagline: "Concevoir aujourd'hui pour inspirer demain",
    services: ["Conception", "Études", "Permis de construire"],
    addressLine1: "70, Av Hassan II – Fès",
    addressLine2: "(Cinéma Empire)",
    phoneLandline: "05 35 65 25 57",
    phoneMobile: "06 61 20 23 54",
    email: "architecte.meliani@gmail.com",
    copyright: "© 2026 Abdelkrim Meliani",
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
    metaTitle: "عبد الكريم مليان — مهندس معماري",
    metaDescription: "مكتب هندسة معمارية بفاس — تصميم، دراسات، ورخص البناء.",
    brand: "Abdelkrim Meliani",
    title: "مهندس معماري (D.P.L.G)",
    tagline: "نُصمم اليوم لنُلهم الغد",
    services: ["التصميم", "الدراسات", "رخص البناء"],
    addressLine1: "70, Av Hassan II – Fès",
    addressLine2: "(Cinéma Empire)",
    phoneLandline: "05 35 65 25 57",
    phoneMobile: "06 61 20 23 54",
    email: "architecte.meliani@gmail.com",
    copyright: "© 2026 عبد الكريم مليان",
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
