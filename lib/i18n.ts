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

type ServiceItem = {
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
};

type PhilosophyPillar = {
  title: string;
  desc: string;
};

type Dictionary = {
  metaTitle: string;
  metaDescription: string;
  brand: string;
  title: string;
  tagline: string;
  nav: {
    home: string;
    services: string;
    philosophy: string;
    contact: string;
    consultBtn: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    exploreBtn: string;
    contactBtn: string;
  };
  contactCard: {
    heading: string;
    addressLine1: string;
    addressLine2: string;
    phoneLandline: string;
    phoneMobile: string;
    email: string;
  };
  servicesSection: {
    tag: string;
    title: string;
    subtitle: string;
    list: ServiceItem[];
  };
  philosophySection: {
    tag: string;
    title: string;
    pillars: PhilosophyPillar[];
  };
  contactSection: {
    tag: string;
    title: string;
    subtitle: string;
    addressLabel: string;
    phoneLabel: string;
    emailLabel: string;
    callNow: string;
    openInMaps: string;
    downloadVCard: string;
  };
  footer: {
    navHeading: string;
    tagline: string;
    copyright: string;
  };
  teamLogin: string;
  privateTitle: string;
  privateSubtitle: string;
  usernameLabel: string;
  passwordLabel: string;
  enterButton: string;
  checkingButton: string;
  errorIncorrect: string;
  errorNotConfigured: string;
  privateYoureIn: string;
  privateBody: string;
  logoutLabel: string;
  manageUsers: string;
  usersAdmin: {
    title: string;
    addUser: string;
    tableEmail: string;
    tableName: string;
    tableRole: string;
    tableStatus: string;
    edit: string;
    back: string;
    emailLabel: string;
    passwordLabel: string;
    passwordEditHint: string;
    firstNameLabel: string;
    lastNameLabel: string;
    phoneLabel: string;
    cinLabel: string;
    roleLabel: string;
    statusLabel: string;
    roles: { client: string; professional: string; admin: string };
    statuses: { pending: string; active: string; suspended: string; banned: string };
    saveButton: string;
    savingButton: string;
    createButton: string;
    creatingButton: string;
    banButton: string;
    banningButton: string;
    banConfirm: string;
    errorGeneric: string;
    errorDuplicate: string;
    errorForbidden: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    metaTitle: "Abdelkrim Meliani — Architect D.P.L.G",
    metaDescription:
      "Architecture practice in Fès, Morocco — design, technical studies, building permits, and construction oversight.",
    brand: "Abdelkrim Meliani",
    title: "Architect D.P.L.G",
    tagline: "Designing today to inspire tomorrow",
    nav: {
      home: "Home",
      services: "Services",
      philosophy: "Philosophy",
      contact: "Contact",
      consultBtn: "Request a Consultation",
    },
    hero: {
      badge: "Registered D.P.L.G Architectural Practice • Fès, Morocco",
      titleStart: "The art of designing",
      titleHighlight: "exceptional spaces",
      titleEnd: "rooted in timeless modernity.",
      subtitle:
        "We design contemporary villas, signature residences, and urban projects in Fès and across the Kingdom of Morocco.",
      exploreBtn: "Our Services",
      contactBtn: "Get in Touch",
    },
    contactCard: {
      heading: "Studio",
      addressLine1: "70, Av Hassan II – Fès",
      addressLine2: "(Cinéma Empire)",
      phoneLandline: "05 35 65 25 57",
      phoneMobile: "06 61 20 23 54",
      email: "architecte.meliani@gmail.com",
    },
    servicesSection: {
      tag: "Scope of Practice",
      title: "Comprehensive Architectural Expertise",
      subtitle:
        "From the first concept sketch to occupancy certification.",
      list: [
        {
          number: "01",
          title: "Architectural Design",
          shortDesc:
            "3D volumetric modeling, bioclimatic orientation, and fluid spatial layout.",
          fullDesc:
            "We craft balanced architectural volumes that respond to daylight, surrounding topography, and how the building will actually be lived in. Every project is designed as a bespoke work.",
          deliverables: [
            "3D volumetric concept models",
            "Detailed floor plans & elevations",
            "Sun-path & bioclimatic study",
            "Curated material palette",
          ],
        },
        {
          number: "02",
          title: "Technical Studies",
          shortDesc:
            "Coordination with structural, MEP, and acoustic engineers, plus a precise bill of quantities.",
          fullDesc:
            "We provide rigorous technical synthesis across all engineering disciplines to ensure structural durability, energy efficiency, and budget control without compromising the design.",
          deliverables: [
            "Special technical specifications (CPS)",
            "Detailed quantity surveys",
            "Execution blueprints (1:50 / 1:20)",
            "Engineering coordination",
          ],
        },
        {
          number: "03",
          title: "Building Permits",
          shortDesc:
            "Filing with the Urban Agency, the Commune, Civil Protection, and the Land Registry.",
          fullDesc:
            "We know the urban planning regulations of Fès and other Moroccan prefectures, and handle the full administrative procedure on your behalf via the Rokhas portal.",
          deliverables: [
            "Complete regulatory application file",
            "Follow-up with the urban planning commission (Rokhas)",
            "Safety & accessibility compliance",
            "Follow-up on approval timelines with authorities",
          ],
        },
        {
          number: "04",
          title: "Construction Oversight",
          shortDesc:
            "Regular site visits, quality control, and assistance through final handover.",
          fullDesc:
            "We ensure the execution stays faithful to the architectural plans, representing the client's interests with the construction companies to secure a clean finish.",
          deliverables: [
            "Weekly site inspection reports",
            "Sample & finish quality checks",
            "Assistance at handover",
            "Occupancy-permit file preparation",
          ],
        },
      ],
    },
    philosophySection: {
      tag: "Design Approach",
      title: "Harmonizing Modern Minimalism with Moroccan Soul",
      pillars: [
        {
          title: "Light & Shadow",
          desc: "Courtyards, contemporary screens, and pergolas used to temper the Fès climate while shaping natural light.",
        },
        {
          title: "Geometric Purity & Noble Materials",
          desc: "Clean architectural concrete, large glazing, and accents of artisanal zellige, Taza stone, and cedar wood.",
        },
        {
          title: "Bioclimatic Commitment",
          desc: "Natural cross-ventilation, optimized thermal mass, and solar orientation for year-round comfort.",
        },
      ],
    },
    contactSection: {
      tag: "Get in Touch",
      title: "Let's Discuss Your Project",
      subtitle: "The studio welcomes you in the heart of Fès.",
      addressLabel: "Address",
      phoneLabel: "Phone",
      emailLabel: "Email",
      callNow: "Call the Studio",
      openInMaps: "Open in Maps",
      downloadVCard: "Save Contact",
    },
    footer: {
      navHeading: "Navigation",
      tagline: "Design • Studies • Building Permits",
      copyright: "© 2026 Abdelkrim Meliani",
    },
    teamLogin: "Team Login",
    privateTitle: "Private Area",
    privateSubtitle: "Sign in with your username and password to continue.",
    usernameLabel: "Username",
    passwordLabel: "Password",
    enterButton: "Enter",
    checkingButton: "Checking…",
    errorIncorrect: "Incorrect username or password.",
    errorNotConfigured: "The private area isn't configured yet.",
    privateYoureIn: "You're in",
    privateBody:
      "The private area is coming soon. This page confirms the gate works — real content lands here in a future phase.",
    logoutLabel: "Log out",
    manageUsers: "Manage Users",
    usersAdmin: {
      title: "Users",
      addUser: "Add User",
      tableEmail: "Username",
      tableName: "Name",
      tableRole: "Role",
      tableStatus: "Status",
      edit: "Edit",
      back: "Back",
      emailLabel: "Username (email)",
      passwordLabel: "Password",
      passwordEditHint: "Leave blank to keep the current password",
      firstNameLabel: "First name",
      lastNameLabel: "Last name",
      phoneLabel: "Phone (10 digits)",
      cinLabel: "CIN",
      roleLabel: "Role",
      statusLabel: "Status",
      roles: { client: "Client", professional: "Professional", admin: "Admin" },
      statuses: { pending: "Pending", active: "Active", suspended: "Suspended", banned: "Banned" },
      saveButton: "Save Changes",
      savingButton: "Saving…",
      createButton: "Create User",
      creatingButton: "Creating…",
      banButton: "Ban User",
      banningButton: "Banning…",
      banConfirm: "Ban this user? They will no longer be able to log in.",
      errorGeneric: "Something went wrong. Please check the fields and try again.",
      errorDuplicate: "That username, phone, or CIN is already in use.",
      errorForbidden: "You don't have access to this page.",
    },
  },
  fr: {
    metaTitle: "Abdelkrim Meliani — Architecte D.P.L.G",
    metaDescription:
      "Cabinet d'architecture à Fès — conception, études techniques, permis de construire et suivi de chantier.",
    brand: "Abdelkrim Meliani",
    title: "Architecte D.P.L.G",
    tagline: "Concevoir aujourd'hui pour inspirer demain",
    nav: {
      home: "Accueil",
      services: "Services",
      philosophy: "Philosophie",
      contact: "Contact",
      consultBtn: "Demander une Étude",
    },
    hero: {
      badge: "Cabinet d'Architecture D.P.L.G • Fès, Maroc",
      titleStart: "L'art de concevoir des",
      titleHighlight: "espaces d'exception",
      titleEnd: "ancrés dans le futur.",
      subtitle:
        "Nous concevons des villas contemporaines, résidences d'exception et projets urbains, à Fès et à travers le Royaume du Maroc.",
      exploreBtn: "Nos Services",
      contactBtn: "Nous Contacter",
    },
    contactCard: {
      heading: "Cabinet",
      addressLine1: "70, Av Hassan II – Fès",
      addressLine2: "(Cinéma Empire)",
      phoneLandline: "05 35 65 25 57",
      phoneMobile: "06 61 20 23 54",
      email: "architecte.meliani@gmail.com",
    },
    servicesSection: {
      tag: "Domaines de Compétence",
      title: "Une Expertise Architecturale Complète",
      subtitle:
        "De la première esquisse jusqu'à l'obtention du permis d'habiter.",
      list: [
        {
          number: "01",
          title: "Conception Architecturale",
          shortDesc:
            "Modélisation 3D, intégration bioclimatique et distribution spatiale fluide.",
          fullDesc:
            "Nous concevons des volumes équilibrés qui dialoguent avec la lumière et le paysage environnant. Chaque projet est pensé comme une pièce sur-mesure.",
          deliverables: [
            "Esquisses volumétriques 3D",
            "Plans d'aménagement détaillés",
            "Étude bioclimatique et ensoleillement",
            "Choix des matériaux",
          ],
        },
        {
          number: "02",
          title: "Études Techniques",
          shortDesc:
            "Coordination avec les bureaux d'études (béton armé, fluides, acoustique) et métrés précis.",
          fullDesc:
            "Nous assurons la synthèse technique entre tous les corps d'état pour garantir la durabilité structurelle et la maîtrise budgétaire sans compromis sur l'esthétique.",
          deliverables: [
            "Cahier des Prescriptions Spéciales (CPS)",
            "Métrés et estimations",
            "Plans d'exécution (1/50 et 1/20)",
            "Coordination des bureaux d'études",
          ],
        },
        {
          number: "03",
          title: "Permis de Construire",
          shortDesc:
            "Instruction des dossiers auprès de l'Agence Urbaine, de la Commune, de la Protection Civile et du Cadastre.",
          fullDesc:
            "Nous maîtrisons les règlements d'urbanisme de Fès et des différentes préfectures du Maroc, et prenons en charge l'ensemble de la procédure administrative via la plateforme Rokhas.",
          deliverables: [
            "Dossier réglementaire complet",
            "Suivi en commission d'urbanisme (Rokhas)",
            "Conformité normes de sécurité",
            "Suivi des délais auprès des autorités",
          ],
        },
        {
          number: "04",
          title: "Suivi de Chantier",
          shortDesc:
            "Visites régulières, contrôle qualité et assistance jusqu'à la réception.",
          fullDesc:
            "Nous veillons à une exécution fidèle aux plans, en défendant les intérêts du maître d'ouvrage auprès des entreprises pour garantir des finitions soignées.",
          deliverables: [
            "Comptes rendus de chantier hebdomadaires",
            "Contrôle des échantillons et finitions",
            "Assistance à la réception",
            "Préparation du dossier de permis d'habiter",
          ],
        },
      ],
    },
    philosophySection: {
      tag: "Vision Architecturale",
      title: "Harmonie entre Épure Moderne et Âme Marocaine",
      pillars: [
        {
          title: "Lumière & Ombres",
          desc: "Patios, claustras contemporains et pergolas pour tempérer le climat fassi tout en sculptant la lumière.",
        },
        {
          title: "Pureté Géométrique & Matériaux Nobles",
          desc: "Béton architectonique épuré, grandes baies vitrées et touches de zellige artisanal, pierre de Taza et bois de cèdre.",
        },
        {
          title: "Engagement Bioclimatique",
          desc: "Ventilation naturelle croisée, inertie thermique optimisée et orientation solaire pour un confort toute l'année.",
        },
      ],
    },
    contactSection: {
      tag: "Nous Rencontrer",
      title: "Discutons de Votre Projet",
      subtitle: "Le cabinet vous accueille au cœur de Fès.",
      addressLabel: "Adresse",
      phoneLabel: "Téléphone",
      emailLabel: "Email",
      callNow: "Appeler le Cabinet",
      openInMaps: "Voir sur la Carte",
      downloadVCard: "Enregistrer le Contact",
    },
    footer: {
      navHeading: "Navigation",
      tagline: "Conception • Études • Permis de construire",
      copyright: "© 2026 Abdelkrim Meliani",
    },
    teamLogin: "Connexion équipe",
    privateTitle: "Espace privé",
    privateSubtitle: "Connectez-vous avec votre nom d'utilisateur et votre mot de passe.",
    usernameLabel: "Nom d'utilisateur",
    passwordLabel: "Mot de passe",
    enterButton: "Entrer",
    checkingButton: "Vérification…",
    errorIncorrect: "Nom d'utilisateur ou mot de passe incorrect.",
    errorNotConfigured: "L'espace privé n'est pas encore configuré.",
    privateYoureIn: "Vous êtes connecté",
    privateBody:
      "L'espace privé arrive bientôt. Cette page confirme que l'accès fonctionne — le contenu réel sera ajouté dans une prochaine phase.",
    logoutLabel: "Se déconnecter",
    manageUsers: "Gérer les utilisateurs",
    usersAdmin: {
      title: "Utilisateurs",
      addUser: "Ajouter un utilisateur",
      tableEmail: "Nom d'utilisateur",
      tableName: "Nom",
      tableRole: "Rôle",
      tableStatus: "Statut",
      edit: "Modifier",
      back: "Retour",
      emailLabel: "Nom d'utilisateur (email)",
      passwordLabel: "Mot de passe",
      passwordEditHint: "Laisser vide pour conserver le mot de passe actuel",
      firstNameLabel: "Prénom",
      lastNameLabel: "Nom",
      phoneLabel: "Téléphone (10 chiffres)",
      cinLabel: "CIN",
      roleLabel: "Rôle",
      statusLabel: "Statut",
      roles: { client: "Client", professional: "Professionnel", admin: "Administrateur" },
      statuses: { pending: "En attente", active: "Actif", suspended: "Suspendu", banned: "Banni" },
      saveButton: "Enregistrer",
      savingButton: "Enregistrement…",
      createButton: "Créer l'utilisateur",
      creatingButton: "Création…",
      banButton: "Bannir l'utilisateur",
      banningButton: "Bannissement…",
      banConfirm: "Bannir cet utilisateur ? Il ne pourra plus se connecter.",
      errorGeneric: "Une erreur est survenue. Vérifiez les champs et réessayez.",
      errorDuplicate: "Ce nom d'utilisateur, téléphone ou CIN est déjà utilisé.",
      errorForbidden: "Vous n'avez pas accès à cette page.",
    },
  },
  ar: {
    metaTitle: "عبد الكريم مليان — مهندس معماري",
    metaDescription:
      "مكتب هندسة معمارية بفاس — تصميم، دراسات تقنية، رخص البناء ومتابعة الأوراش.",
    brand: "Abdelkrim Meliani",
    title: "مهندس معماري (D.P.L.G)",
    tagline: "نُصمم اليوم لنُلهم الغد",
    nav: {
      home: "الرئيسية",
      services: "الخدمات",
      philosophy: "فلسفتنا",
      contact: "اتصل بنا",
      consultBtn: "طلب استشارة",
    },
    hero: {
      badge: "مكتب الهندسة المعمارية D.P.L.G • فاس، المغرب",
      titleStart: "فن تصميم",
      titleHighlight: "فضاءات معمارية استثنائية",
      titleEnd: "تجمع بين الأصالة والمستقبل.",
      subtitle:
        "نصمم فيلات معاصرة، إقامات مميزة ومشاريع حضرية في فاس وعبر ربوع المملكة المغربية.",
      exploreBtn: "خدماتنا",
      contactBtn: "اتصل بنا",
    },
    contactCard: {
      heading: "المكتب",
      addressLine1: "70, Av Hassan II – Fès",
      addressLine2: "(Cinéma Empire)",
      phoneLandline: "05 35 65 25 57",
      phoneMobile: "06 61 20 23 54",
      email: "architecte.meliani@gmail.com",
    },
    servicesSection: {
      tag: "مجالات الاختصاص",
      title: "خبرة معمارية شاملة",
      subtitle: "من أول رسم أولي وحتى الحصول على رخصة السكن.",
      list: [
        {
          number: "01",
          title: "التصميم المعماري",
          shortDesc:
            "نمذجة ثلاثية الأبعاد، توجيه مناخي ذكي وتوزيع مساحات سلس.",
          fullDesc:
            "نصمم كتلاً معمارية متوازنة تتناغم مع الإضاءة الطبيعية والمحيط. كل مشروع يُصمم كعمل فريد على المقاس.",
          deliverables: [
            "مجسمات ورسومات ثلاثية الأبعاد",
            "مخططات تفصيلية للتوزيع",
            "دراسة مناخية للتهوية والشمس",
            "اختيار المواد",
          ],
        },
        {
          number: "02",
          title: "الدراسات التقنية",
          shortDesc:
            "تنسيق مع مكاتب الدراسات (الخرسانة والسوائل والصوتيات) وجدول قياسات دقيق.",
          fullDesc:
            "نضمن الانسجام التقني بين كافة التخصصات لضمان المتانة الإنشائية والتحكم في الميزانية دون المساس بالتصميم.",
          deliverables: [
            "دفتر الشروط والتحملات (CPS)",
            "جدول القياسات والتقديرات",
            "مخططات تنفيذية",
            "تنسيق مكاتب الدراسات",
          ],
        },
        {
          number: "03",
          title: "رخص البناء",
          shortDesc:
            "متابعة الملفات لدى الوكالة الحضرية والجماعة والوقاية المدنية والمحافظة العقارية.",
          fullDesc:
            "نتقن ضوابط التعمير بمدينة فاس ومختلف أقاليم المملكة، ونتكفل بكامل الإجراءات الإدارية عبر منصة رخص نيابة عنكم.",
          deliverables: [
            "إعداد الملف القانوني الكامل",
            "متابعة لجنة التعمير (رخص)",
            "مطابقة معايير السلامة",
            "متابعة آجال المصادقة لدى السلطات",
          ],
        },
        {
          number: "04",
          title: "متابعة الأوراش",
          shortDesc: "زيارات ميدانية دورية، مراقبة الجودة، ومرافقة حتى التسليم.",
          fullDesc:
            "نحرص على تنفيذ مطابق للمخططات، وندافع عن مصالح صاحب المشروع أمام المقاولين لضمان تشطيبات متقنة.",
          deliverables: [
            "محاضر زيارات الورش الأسبوعية",
            "فحص العينات والتشطيبات",
            "المرافقة عند التسليم",
            "إعداد ملف رخصة السكن",
          ],
        },
      ],
    },
    philosophySection: {
      tag: "رؤيتنا المعمارية",
      title: "التناغم بين الحداثة والروح المغربية",
      pillars: [
        {
          title: "النور والظلال",
          desc: "أفنية داخلية ومشربيات وبرغولات لترويض مناخ فاس مع استثمار الإضاءة الطبيعية.",
        },
        {
          title: "النقاء الهندسي والمواد النبيلة",
          desc: "خرسانة معمارية نقية وواجهات زجاجية واسعة مع لمسات من الزليج التراثي وحجر تازة وخشب الأرز.",
        },
        {
          title: "الالتزام البيئي",
          desc: "تهوية طبيعية متقاطعة وكتلة حرارية محسّنة وتوجيه شمسي لراحة على مدار السنة.",
        },
      ],
    },
    contactSection: {
      tag: "تواصل معنا",
      title: "لنناقش مشروعك",
      subtitle: "يستقبلكم المكتب في قلب مدينة فاس.",
      addressLabel: "العنوان",
      phoneLabel: "الهاتف",
      emailLabel: "البريد الإلكتروني",
      callNow: "اتصل بالمكتب",
      openInMaps: "فتح في الخريطة",
      downloadVCard: "حفظ جهة الاتصال",
    },
    footer: {
      navHeading: "أقسام الموقع",
      tagline: "التصميم • الدراسات • رخص البناء",
      copyright: "© 2026 عبد الكريم مليان",
    },
    teamLogin: "دخول الفريق",
    privateTitle: "المنطقة الخاصة",
    privateSubtitle: "سجّل الدخول باسم المستخدم وكلمة المرور للمتابعة.",
    usernameLabel: "اسم المستخدم",
    passwordLabel: "كلمة المرور",
    enterButton: "دخول",
    checkingButton: "جارٍ التحقق…",
    errorIncorrect: "اسم المستخدم أو كلمة المرور غير صحيحة.",
    errorNotConfigured: "المنطقة الخاصة غير مهيأة بعد.",
    privateYoureIn: "لقد دخلت",
    privateBody:
      "المنطقة الخاصة قادمة قريبًا. تؤكد هذه الصفحة أن الحماية تعمل — سيتم إضافة المحتوى الحقيقي في مرحلة قادمة.",
    logoutLabel: "تسجيل الخروج",
    manageUsers: "إدارة المستخدمين",
    usersAdmin: {
      title: "المستخدمون",
      addUser: "إضافة مستخدم",
      tableEmail: "اسم المستخدم",
      tableName: "الاسم",
      tableRole: "الدور",
      tableStatus: "الحالة",
      edit: "تعديل",
      back: "رجوع",
      emailLabel: "اسم المستخدم (البريد الإلكتروني)",
      passwordLabel: "كلمة المرور",
      passwordEditHint: "اتركه فارغًا للاحتفاظ بكلمة المرور الحالية",
      firstNameLabel: "الاسم الأول",
      lastNameLabel: "اسم العائلة",
      phoneLabel: "الهاتف (10 أرقام)",
      cinLabel: "رقم البطاقة الوطنية",
      roleLabel: "الدور",
      statusLabel: "الحالة",
      roles: { client: "عميل", professional: "مهني", admin: "مدير" },
      statuses: { pending: "قيد الانتظار", active: "نشط", suspended: "موقوف", banned: "محظور" },
      saveButton: "حفظ التغييرات",
      savingButton: "جارٍ الحفظ…",
      createButton: "إنشاء المستخدم",
      creatingButton: "جارٍ الإنشاء…",
      banButton: "حظر المستخدم",
      banningButton: "جارٍ الحظر…",
      banConfirm: "هل تريد حظر هذا المستخدم؟ لن يتمكن بعد الآن من تسجيل الدخول.",
      errorGeneric: "حدث خطأ ما. تحقق من الحقول وحاول مرة أخرى.",
      errorDuplicate: "اسم المستخدم أو الهاتف أو رقم البطاقة الوطنية مستخدم بالفعل.",
      errorForbidden: "ليس لديك صلاحية الوصول إلى هذه الصفحة.",
    },
  },
};
