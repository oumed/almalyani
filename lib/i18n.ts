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
  privateNav: {
    dashboard: string;
    users: string;
    projects: string;
    signedInAs: string;
    searchPlaceholder: string;
  };
  searchSection: {
    title: string;
    resultsFor: string;
    tableType: string;
    tableMatch: string;
    tableContext: string;
    empty: string;
    emptyQuery: string;
    types: {
      user: string;
      project: string;
      document: string;
      task: string;
      clarification: string;
      permit: string;
      proposal: string;
    };
  };
  dashboardSection: {
    greeting: string;
    statUsers: string;
    statProjects: string;
    statActiveProjects: string;
  };
  projectTabs: {
    overview: string;
    teamPhases: string;
    workflow: string;
    permits: string;
    financial: string;
    bimSite: string;
    bimSiteTooltip: string;
  };
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
    allRoles: string;
    filterLabel: string;
    exportButton: string;
    importButton: string;
  };
  usersImport: {
    title: string;
    instructions: string;
    columns: string;
    fileLabel: string;
    importButton: string;
    importingButton: string;
    back: string;
    resultCreated: string;
    resultFailed: string;
    errorNoFile: string;
    errorEmptyFile: string;
    errorRow: string;
  };
  manageProjects: string;
  projectsAdmin: {
    title: string;
    addProject: string;
    tableTitle: string;
    tableClient: string;
    tableStatus: string;
    tableBudget: string;
    edit: string;
    back: string;
    titleLabel: string;
    clientLabel: string;
    descriptionLabel: string;
    cadastralLabel: string;
    landSurfaceLabel: string;
    builtSurfaceLabel: string;
    budgetMinLabel: string;
    budgetMaxLabel: string;
    statusLabel: string;
    statuses: {
      draft: string;
      topo_needed: string;
      sketching: string;
      client_review: string;
      rokhas_submitted: string;
      rokhas_rejected: string;
      taxes_pending: string;
      permit_issued: string;
      construction: string;
      occupancy_pending: string;
      closed: string;
    };
    saveButton: string;
    savingButton: string;
    createButton: string;
    creatingButton: string;
    closeButton: string;
    closingButton: string;
    errorGeneric: string;
    errorForbidden: string;
  };
  projectTeam: {
    title: string;
    tableName: string;
    tableRole: string;
    tableActive: string;
    active: string;
    inactive: string;
    remove: string;
    reactivate: string;
    addMemberTitle: string;
    memberLabel: string;
    roleLabel: string;
    roles: {
      architect: string;
      bet_engineer: string;
      rebar_controller: string;
      topographer: string;
      main_contractor: string;
    };
    addButton: string;
    addingButton: string;
    empty: string;
    errorGeneric: string;
    errorDuplicate: string;
  };
  projectPhases: {
    title: string;
    tableOrder: string;
    tableName: string;
    tableStatus: string;
    tableProgress: string;
    addPhaseTitle: string;
    nameLabel: string;
    orderLabel: string;
    statusLabel: string;
    statuses: { not_started: string; active: string; completed: string };
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    errorGeneric: string;
  };
  projectTasksSection: {
    title: string;
    tablePhase: string;
    tableTitle: string;
    tableAssignee: string;
    tableStatus: string;
    phaseLabel: string;
    titleLabel: string;
    assigneeLabel: string;
    unassigned: string;
    statusLabel: string;
    statuses: { todo: string; in_progress: string; review: string; done: string };
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    errorGeneric: string;
  };
  projectDocumentsSection: {
    title: string;
    tableTitle: string;
    tableType: string;
    tableStatus: string;
    titleLabel: string;
    fileUrlLabel: string;
    typeLabel: string;
    statusLabel: string;
    statuses: { WIP: string; Shared: string; Published: string; Archived: string };
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    errorGeneric: string;
  };
  projectClarifications: {
    title: string;
    tableQuestion: string;
    tablePriority: string;
    tableStatus: string;
    questionLabel: string;
    priorityLabel: string;
    priorities: { low: string; medium: string; high: string };
    statusLabel: string;
    statuses: { open: string; answered: string; closed: string };
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    errorGeneric: string;
  };
  projectApprovals: {
    title: string;
    tableTitle: string;
    tableStatus: string;
    titleLabel: string;
    descriptionLabel: string;
    statusLabel: string;
    statuses: {
      submitted: string;
      under_review: string;
      approved: string;
      rejected: string;
      revised: string;
    };
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    errorGeneric: string;
  };
  buildingPermitSection: {
    title: string;
    rokhasRefLabel: string;
    statusLabel: string;
    statuses: { draft: string; submitted: string; rejected: string; approved: string; delivered: string };
    civilTaxLabel: string;
    urbanTaxLabel: string;
    communeTaxLabel: string;
    totalTaxLabel: string;
    saveButton: string;
    savingButton: string;
    errorGeneric: string;
  };
  occupancyPermitSection: {
    title: string;
    statusLabel: string;
    statuses: {
      not_requested: string;
      inspection_scheduled: string;
      compliance_ok: string;
      issued: string;
      rejected: string;
    };
    notesLabel: string;
    certificateUrlLabel: string;
    saveButton: string;
    savingButton: string;
    errorGeneric: string;
  };
  proposalsSection: {
    title: string;
    tableProfessional: string;
    tableAmount: string;
    tableStatus: string;
    professionalLabel: string;
    amountLabel: string;
    textLabel: string;
    statusLabel: string;
    statuses: {
      draft: string;
      submitted: string;
      under_review: string;
      accepted: string;
      rejected: string;
      withdrawn: string;
    };
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    errorGeneric: string;
  };
  contractsSection: {
    title: string;
    tableProfessional: string;
    tableAmount: string;
    tableStatus: string;
    proposalLabel: string;
    amountLabel: string;
    statusLabel: string;
    statuses: { draft: string; active: string; completed: string; terminated: string };
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    noProposals: string;
    errorGeneric: string;
  };
  paymentsSection: {
    title: string;
    tableTarget: string;
    tableAmount: string;
    tableType: string;
    tableStatus: string;
    targetLabel: string;
    contractOption: string;
    permitOption: string;
    amountLabel: string;
    typeLabel: string;
    types: { contract_fee: string; tax: string; other: string };
    methodLabel: string;
    methods: { bank_transfer: string; cash: string; check: string };
    statusLabel: string;
    statuses: { pending: string; completed: string; failed: string; refunded: string };
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
    noTargets: string;
    errorGeneric: string;
  };
  buildingModelsSection: {
    title: string;
    tableSoftware: string;
    tableIfc: string;
    tableState: string;
    softwareLabel: string;
    ifcVersionLabel: string;
    fileUrlLabel: string;
    stateLabel: string;
    addButton: string;
    addingButton: string;
    empty: string;
    errorGeneric: string;
  };
  modelComponentsSection: {
    title: string;
    tableModel: string;
    tableElementType: string;
    tableMaterial: string;
    tableVolume: string;
    modelLabel: string;
    globalIdLabel: string;
    elementTypeLabel: string;
    materialLabel: string;
    volumeLabel: string;
    areaLabel: string;
    addButton: string;
    addingButton: string;
    empty: string;
    noModels: string;
    errorGeneric: string;
  };
  siteProgressSection: {
    title: string;
    tableDate: string;
    tableDescription: string;
    tableProgress: string;
    tableWeather: string;
    descriptionLabel: string;
    percentLabel: string;
    weatherLabel: string;
    workersLabel: string;
    addButton: string;
    addingButton: string;
    empty: string;
    errorGeneric: string;
  };
  documentVersionsSection: {
    title: string;
    tableDocument: string;
    tableVersion: string;
    tableChange: string;
    documentLabel: string;
    versionLabel: string;
    fileUrlLabel: string;
    changeLabel: string;
    addButton: string;
    addingButton: string;
    empty: string;
    noDocuments: string;
    errorGeneric: string;
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
    privateNav: {
      dashboard: "Dashboard",
      users: "Users",
      projects: "Projects",
      signedInAs: "Signed in as",
      searchPlaceholder: "Search…",
    },
    searchSection: {
      title: "Search",
      resultsFor: "Results for",
      tableType: "Type",
      tableMatch: "Match",
      tableContext: "Context",
      empty: "No results found.",
      emptyQuery: "Type something to search across users and projects.",
      types: {
        user: "User",
        project: "Project",
        document: "Document",
        task: "Task",
        clarification: "Clarification",
        permit: "Permit",
        proposal: "Proposal",
      },
    },
    dashboardSection: {
      greeting: "Welcome back",
      statUsers: "Users",
      statProjects: "Projects",
      statActiveProjects: "Active Projects",
    },
    projectTabs: {
      overview: "Overview",
      teamPhases: "Team & Phases",
      workflow: "Workflow",
      permits: "Permits",
      financial: "Financial",
      bimSite: "BIM & Site",
      bimSiteTooltip: "BIM: Building Information Modeling — a 3D digital model of the building",
    },
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
      allRoles: "All roles",
      filterLabel: "Role",
      exportButton: "Export",
      importButton: "Import",
    },
    usersImport: {
      title: "Import Users",
      instructions: "Upload a CSV file with a header row using these exact column names:",
      columns: "email, password, firstName, lastName, phone, cin, userType, status",
      fileLabel: "CSV file",
      importButton: "Import",
      importingButton: "Importing…",
      back: "Back",
      resultCreated: "created",
      resultFailed: "failed",
      errorNoFile: "Choose a CSV file first.",
      errorEmptyFile: "The file has no data rows.",
      errorRow: "Row",
    },
    manageProjects: "Manage Projects",
    projectsAdmin: {
      title: "Projects",
      addProject: "Add Project",
      tableTitle: "Title",
      tableClient: "Client",
      tableStatus: "Status",
      tableBudget: "Budget (MAD)",
      edit: "Edit",
      back: "Back",
      titleLabel: "Title",
      clientLabel: "Client",
      descriptionLabel: "Description",
      cadastralLabel: "Cadastral number",
      landSurfaceLabel: "Land surface (m²)",
      builtSurfaceLabel: "Built surface (m²)",
      budgetMinLabel: "Budget min (MAD)",
      budgetMaxLabel: "Budget max (MAD)",
      statusLabel: "Status",
      statuses: {
        draft: "Draft",
        topo_needed: "Topo needed",
        sketching: "Sketching",
        client_review: "Client review",
        rokhas_submitted: "Rokhas submitted",
        rokhas_rejected: "Rokhas rejected",
        taxes_pending: "Taxes pending",
        permit_issued: "Permit issued",
        construction: "Construction",
        occupancy_pending: "Occupancy pending",
        closed: "Closed",
      },
      saveButton: "Save Changes",
      savingButton: "Saving…",
      createButton: "Create Project",
      creatingButton: "Creating…",
      closeButton: "Close Project",
      closingButton: "Closing…",
      errorGeneric: "Something went wrong. Please check the fields and try again.",
      errorForbidden: "You don't have access to this page.",
    },
    projectTeam: {
      title: "Team Members",
      tableName: "Name",
      tableRole: "Role",
      tableActive: "Status",
      active: "Active",
      inactive: "Inactive",
      remove: "Remove",
      reactivate: "Reactivate",
      addMemberTitle: "Add Team Member",
      memberLabel: "User",
      roleLabel: "Role",
      roles: {
        architect: "Architect",
        bet_engineer: "Engineering Firm",
        rebar_controller: "Rebar Controller",
        topographer: "Topographer",
        main_contractor: "Main Contractor",
      },
      addButton: "Add",
      addingButton: "Adding…",
      empty: "No team members yet.",
      errorGeneric: "Something went wrong. Please try again.",
      errorDuplicate: "This user already has that role on this project.",
    },
    projectPhases: {
      title: "Phases",
      tableOrder: "#",
      tableName: "Name",
      tableStatus: "Status",
      tableProgress: "Progress",
      addPhaseTitle: "Add Phase",
      nameLabel: "Name",
      orderLabel: "Order",
      statusLabel: "Status",
      statuses: { not_started: "Not started", active: "Active", completed: "Completed" },
      addButton: "Add",
      addingButton: "Adding…",
      updateButton: "Update",
      empty: "No phases yet.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    projectTasksSection: {
      title: "Tasks",
      tablePhase: "Phase",
      tableTitle: "Task",
      tableAssignee: "Assignee",
      tableStatus: "Status",
      phaseLabel: "Phase",
      titleLabel: "Task",
      assigneeLabel: "Assignee",
      unassigned: "Unassigned",
      statusLabel: "Status",
      statuses: { todo: "To do", in_progress: "In progress", review: "Review", done: "Done" },
      addButton: "Add",
      addingButton: "Adding…",
      updateButton: "Update",
      empty: "No tasks yet.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    projectDocumentsSection: {
      title: "Documents",
      tableTitle: "Title",
      tableType: "Type",
      tableStatus: "Status",
      titleLabel: "Title",
      fileUrlLabel: "File URL",
      typeLabel: "Type",
      statusLabel: "Status",
      statuses: { WIP: "Work in progress", Shared: "Shared", Published: "Published", Archived: "Archived" },
      addButton: "Add",
      addingButton: "Adding…",
      updateButton: "Update",
      empty: "No documents yet.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    projectClarifications: {
      title: "Clarification Requests",
      tableQuestion: "Question",
      tablePriority: "Priority",
      tableStatus: "Status",
      questionLabel: "Question",
      priorityLabel: "Priority",
      priorities: { low: "Low", medium: "Medium", high: "High" },
      statusLabel: "Status",
      statuses: { open: "Open", answered: "Answered", closed: "Closed" },
      addButton: "Add",
      addingButton: "Adding…",
      updateButton: "Update",
      empty: "No clarification requests yet.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    projectApprovals: {
      title: "Approval Submissions",
      tableTitle: "Title",
      tableStatus: "Status",
      titleLabel: "Title",
      descriptionLabel: "Description",
      statusLabel: "Status",
      statuses: {
        submitted: "Submitted",
        under_review: "Under review",
        approved: "Approved",
        rejected: "Rejected",
        revised: "Revised",
      },
      addButton: "Add",
      addingButton: "Adding…",
      updateButton: "Update",
      empty: "No approval submissions yet.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    buildingPermitSection: {
      title: "Building Permit",
      rokhasRefLabel: "Rokhas reference",
      statusLabel: "Status",
      statuses: {
        draft: "Draft",
        submitted: "Submitted",
        rejected: "Rejected",
        approved: "Approved",
        delivered: "Delivered",
      },
      civilTaxLabel: "Civil tax paid",
      urbanTaxLabel: "Urban tax paid",
      communeTaxLabel: "Commune tax paid",
      totalTaxLabel: "Total tax amount (MAD)",
      saveButton: "Save",
      savingButton: "Saving…",
      errorGeneric: "Something went wrong. Please try again.",
    },
    occupancyPermitSection: {
      title: "Occupancy Permit",
      statusLabel: "Status",
      statuses: {
        not_requested: "Not requested",
        inspection_scheduled: "Inspection scheduled",
        compliance_ok: "Compliance OK",
        issued: "Issued",
        rejected: "Rejected",
      },
      notesLabel: "Inspection notes",
      certificateUrlLabel: "Compliance certificate URL",
      saveButton: "Save",
      savingButton: "Saving…",
      errorGeneric: "Something went wrong. Please try again.",
    },
    proposalsSection: {
      title: "Proposals",
      tableProfessional: "Professional",
      tableAmount: "Amount (MAD)",
      tableStatus: "Status",
      professionalLabel: "Professional",
      amountLabel: "Amount (MAD)",
      textLabel: "Proposal text",
      statusLabel: "Status",
      statuses: {
        draft: "Draft",
        submitted: "Submitted",
        under_review: "Under review",
        accepted: "Accepted",
        rejected: "Rejected",
        withdrawn: "Withdrawn",
      },
      addButton: "Add",
      addingButton: "Adding…",
      updateButton: "Update",
      empty: "No proposals yet.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    contractsSection: {
      title: "Contracts",
      tableProfessional: "Professional",
      tableAmount: "Total (MAD)",
      tableStatus: "Status",
      proposalLabel: "Proposal",
      amountLabel: "Total amount (MAD)",
      statusLabel: "Status",
      statuses: { draft: "Draft", active: "Active", completed: "Completed", terminated: "Terminated" },
      addButton: "Add",
      addingButton: "Adding…",
      updateButton: "Update",
      empty: "No contracts yet.",
      noProposals: "Add a proposal first to create a contract.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    paymentsSection: {
      title: "Payments",
      tableTarget: "For",
      tableAmount: "Amount (MAD)",
      tableType: "Type",
      tableStatus: "Status",
      targetLabel: "For",
      contractOption: "Contract",
      permitOption: "Building Permit",
      amountLabel: "Amount (MAD)",
      typeLabel: "Type",
      types: { contract_fee: "Contract fee", tax: "Tax", other: "Other" },
      methodLabel: "Method",
      methods: { bank_transfer: "Bank transfer", cash: "Cash", check: "Check" },
      statusLabel: "Status",
      statuses: { pending: "Pending", completed: "Completed", failed: "Failed", refunded: "Refunded" },
      addButton: "Add",
      addingButton: "Adding…",
      updateButton: "Update",
      empty: "No payments yet.",
      noTargets: "Add a contract or building permit first to record a payment.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    buildingModelsSection: {
      title: "Building Models",
      tableSoftware: "Software",
      tableIfc: "IFC Version",
      tableState: "State",
      softwareLabel: "Software used",
      ifcVersionLabel: "IFC version",
      fileUrlLabel: "File URL",
      stateLabel: "Model state",
      addButton: "Add",
      addingButton: "Adding…",
      empty: "No building models yet.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    modelComponentsSection: {
      title: "Model Components",
      tableModel: "Model",
      tableElementType: "Element Type",
      tableMaterial: "Material",
      tableVolume: "Volume (m³)",
      modelLabel: "Building model",
      globalIdLabel: "Global ID",
      elementTypeLabel: "Element type",
      materialLabel: "Material",
      volumeLabel: "Volume (m³)",
      areaLabel: "Area (m²)",
      addButton: "Add",
      addingButton: "Adding…",
      empty: "No components yet.",
      noModels: "Add a building model first to add components.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    siteProgressSection: {
      title: "Site Progress Log",
      tableDate: "Date",
      tableDescription: "Description",
      tableProgress: "Progress",
      tableWeather: "Weather",
      descriptionLabel: "Description",
      percentLabel: "Percent complete",
      weatherLabel: "Weather",
      workersLabel: "Workers on site",
      addButton: "Add Entry",
      addingButton: "Adding…",
      empty: "No progress entries yet.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    documentVersionsSection: {
      title: "Document Versions",
      tableDocument: "Document",
      tableVersion: "Version",
      tableChange: "Change",
      documentLabel: "Document",
      versionLabel: "Version number",
      fileUrlLabel: "File URL",
      changeLabel: "Change description",
      addButton: "Add",
      addingButton: "Adding…",
      empty: "No versions yet.",
      noDocuments: "Add a document first to record a version.",
      errorGeneric: "Something went wrong. Please try again.",
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
    privateNav: {
      dashboard: "Tableau de bord",
      users: "Utilisateurs",
      projects: "Projets",
      signedInAs: "Connecté en tant que",
      searchPlaceholder: "Rechercher…",
    },
    searchSection: {
      title: "Recherche",
      resultsFor: "Résultats pour",
      tableType: "Type",
      tableMatch: "Résultat",
      tableContext: "Contexte",
      empty: "Aucun résultat trouvé.",
      emptyQuery: "Tapez quelque chose pour rechercher parmi les utilisateurs et les projets.",
      types: {
        user: "Utilisateur",
        project: "Projet",
        document: "Document",
        task: "Tâche",
        clarification: "Clarification",
        permit: "Permis",
        proposal: "Proposition",
      },
    },
    dashboardSection: {
      greeting: "Bon retour",
      statUsers: "Utilisateurs",
      statProjects: "Projets",
      statActiveProjects: "Projets actifs",
    },
    projectTabs: {
      overview: "Aperçu",
      teamPhases: "Équipe & Phases",
      workflow: "Flux de travail",
      permits: "Permis",
      financial: "Finances",
      bimSite: "BIM & Chantier",
      bimSiteTooltip: "BIM : Building Information Modeling — maquette numérique 3D du bâtiment",
    },
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
      allRoles: "Tous les rôles",
      filterLabel: "Rôle",
      exportButton: "Exporter",
      importButton: "Importer",
    },
    usersImport: {
      title: "Importer des utilisateurs",
      instructions: "Téléversez un fichier CSV avec une ligne d'en-tête utilisant exactement ces noms de colonnes :",
      columns: "email, password, firstName, lastName, phone, cin, userType, status",
      fileLabel: "Fichier CSV",
      importButton: "Importer",
      importingButton: "Importation…",
      back: "Retour",
      resultCreated: "créés",
      resultFailed: "échoués",
      errorNoFile: "Choisissez d'abord un fichier CSV.",
      errorEmptyFile: "Le fichier ne contient aucune ligne de données.",
      errorRow: "Ligne",
    },
    manageProjects: "Gérer les projets",
    projectsAdmin: {
      title: "Projets",
      addProject: "Ajouter un projet",
      tableTitle: "Titre",
      tableClient: "Client",
      tableStatus: "Statut",
      tableBudget: "Budget (MAD)",
      edit: "Modifier",
      back: "Retour",
      titleLabel: "Titre",
      clientLabel: "Client",
      descriptionLabel: "Description",
      cadastralLabel: "Numéro cadastral",
      landSurfaceLabel: "Surface du terrain (m²)",
      builtSurfaceLabel: "Surface bâtie (m²)",
      budgetMinLabel: "Budget min (MAD)",
      budgetMaxLabel: "Budget max (MAD)",
      statusLabel: "Statut",
      statuses: {
        draft: "Brouillon",
        topo_needed: "Topographie requise",
        sketching: "Esquisse",
        client_review: "Revue client",
        rokhas_submitted: "Rokhas soumis",
        rokhas_rejected: "Rokhas rejeté",
        taxes_pending: "Taxes en attente",
        permit_issued: "Permis délivré",
        construction: "Construction",
        occupancy_pending: "Permis d'habiter en attente",
        closed: "Clôturé",
      },
      saveButton: "Enregistrer",
      savingButton: "Enregistrement…",
      createButton: "Créer le projet",
      creatingButton: "Création…",
      closeButton: "Clôturer le projet",
      closingButton: "Clôture…",
      errorGeneric: "Une erreur est survenue. Vérifiez les champs et réessayez.",
      errorForbidden: "Vous n'avez pas accès à cette page.",
    },
    projectTeam: {
      title: "Équipe du projet",
      tableName: "Nom",
      tableRole: "Rôle",
      tableActive: "Statut",
      active: "Actif",
      inactive: "Inactif",
      remove: "Retirer",
      reactivate: "Réactiver",
      addMemberTitle: "Ajouter un membre",
      memberLabel: "Utilisateur",
      roleLabel: "Rôle",
      roles: {
        architect: "Architecte",
        bet_engineer: "Bureau d'études",
        rebar_controller: "Contrôleur ferraillage",
        topographer: "Topographe",
        main_contractor: "Entreprise principale",
      },
      addButton: "Ajouter",
      addingButton: "Ajout…",
      empty: "Aucun membre pour le moment.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
      errorDuplicate: "Cet utilisateur a déjà ce rôle sur ce projet.",
    },
    projectPhases: {
      title: "Phases",
      tableOrder: "#",
      tableName: "Nom",
      tableStatus: "Statut",
      tableProgress: "Progression",
      addPhaseTitle: "Ajouter une phase",
      nameLabel: "Nom",
      orderLabel: "Ordre",
      statusLabel: "Statut",
      statuses: { not_started: "Non démarrée", active: "En cours", completed: "Terminée" },
      addButton: "Ajouter",
      addingButton: "Ajout…",
      updateButton: "Mettre à jour",
      empty: "Aucune phase pour le moment.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    projectTasksSection: {
      title: "Tâches",
      tablePhase: "Phase",
      tableTitle: "Tâche",
      tableAssignee: "Assigné à",
      tableStatus: "Statut",
      phaseLabel: "Phase",
      titleLabel: "Tâche",
      assigneeLabel: "Assigné à",
      unassigned: "Non assignée",
      statusLabel: "Statut",
      statuses: { todo: "À faire", in_progress: "En cours", review: "Révision", done: "Terminée" },
      addButton: "Ajouter",
      addingButton: "Ajout…",
      updateButton: "Mettre à jour",
      empty: "Aucune tâche pour le moment.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    projectDocumentsSection: {
      title: "Documents",
      tableTitle: "Titre",
      tableType: "Type",
      tableStatus: "Statut",
      titleLabel: "Titre",
      fileUrlLabel: "URL du fichier",
      typeLabel: "Type",
      statusLabel: "Statut",
      statuses: { WIP: "En cours", Shared: "Partagé", Published: "Publié", Archived: "Archivé" },
      addButton: "Ajouter",
      addingButton: "Ajout…",
      updateButton: "Mettre à jour",
      empty: "Aucun document pour le moment.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    projectClarifications: {
      title: "Demandes de clarification",
      tableQuestion: "Question",
      tablePriority: "Priorité",
      tableStatus: "Statut",
      questionLabel: "Question",
      priorityLabel: "Priorité",
      priorities: { low: "Faible", medium: "Moyenne", high: "Élevée" },
      statusLabel: "Statut",
      statuses: { open: "Ouverte", answered: "Répondue", closed: "Fermée" },
      addButton: "Ajouter",
      addingButton: "Ajout…",
      updateButton: "Mettre à jour",
      empty: "Aucune demande pour le moment.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    projectApprovals: {
      title: "Soumissions d'approbation",
      tableTitle: "Titre",
      tableStatus: "Statut",
      titleLabel: "Titre",
      descriptionLabel: "Description",
      statusLabel: "Statut",
      statuses: {
        submitted: "Soumise",
        under_review: "En révision",
        approved: "Approuvée",
        rejected: "Rejetée",
        revised: "Révisée",
      },
      addButton: "Ajouter",
      addingButton: "Ajout…",
      updateButton: "Mettre à jour",
      empty: "Aucune soumission pour le moment.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    buildingPermitSection: {
      title: "Permis de Construire",
      rokhasRefLabel: "Référence Rokhas",
      statusLabel: "Statut",
      statuses: {
        draft: "Brouillon",
        submitted: "Soumis",
        rejected: "Rejeté",
        approved: "Approuvé",
        delivered: "Délivré",
      },
      civilTaxLabel: "Taxe civile payée",
      urbanTaxLabel: "Taxe urbaine payée",
      communeTaxLabel: "Taxe communale payée",
      totalTaxLabel: "Montant total des taxes (MAD)",
      saveButton: "Enregistrer",
      savingButton: "Enregistrement…",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    occupancyPermitSection: {
      title: "Permis d'Habiter",
      statusLabel: "Statut",
      statuses: {
        not_requested: "Non demandé",
        inspection_scheduled: "Inspection planifiée",
        compliance_ok: "Conformité validée",
        issued: "Délivré",
        rejected: "Rejeté",
      },
      notesLabel: "Notes d'inspection",
      certificateUrlLabel: "URL du certificat de conformité",
      saveButton: "Enregistrer",
      savingButton: "Enregistrement…",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    proposalsSection: {
      title: "Propositions",
      tableProfessional: "Professionnel",
      tableAmount: "Montant (MAD)",
      tableStatus: "Statut",
      professionalLabel: "Professionnel",
      amountLabel: "Montant (MAD)",
      textLabel: "Texte de la proposition",
      statusLabel: "Statut",
      statuses: {
        draft: "Brouillon",
        submitted: "Soumise",
        under_review: "En révision",
        accepted: "Acceptée",
        rejected: "Rejetée",
        withdrawn: "Retirée",
      },
      addButton: "Ajouter",
      addingButton: "Ajout…",
      updateButton: "Mettre à jour",
      empty: "Aucune proposition pour le moment.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    contractsSection: {
      title: "Contrats",
      tableProfessional: "Professionnel",
      tableAmount: "Total (MAD)",
      tableStatus: "Statut",
      proposalLabel: "Proposition",
      amountLabel: "Montant total (MAD)",
      statusLabel: "Statut",
      statuses: { draft: "Brouillon", active: "Actif", completed: "Terminé", terminated: "Résilié" },
      addButton: "Ajouter",
      addingButton: "Ajout…",
      updateButton: "Mettre à jour",
      empty: "Aucun contrat pour le moment.",
      noProposals: "Ajoutez d'abord une proposition pour créer un contrat.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    paymentsSection: {
      title: "Paiements",
      tableTarget: "Pour",
      tableAmount: "Montant (MAD)",
      tableType: "Type",
      tableStatus: "Statut",
      targetLabel: "Pour",
      contractOption: "Contrat",
      permitOption: "Permis de Construire",
      amountLabel: "Montant (MAD)",
      typeLabel: "Type",
      types: { contract_fee: "Frais de contrat", tax: "Taxe", other: "Autre" },
      methodLabel: "Méthode",
      methods: { bank_transfer: "Virement bancaire", cash: "Espèces", check: "Chèque" },
      statusLabel: "Statut",
      statuses: { pending: "En attente", completed: "Terminé", failed: "Échoué", refunded: "Remboursé" },
      addButton: "Ajouter",
      addingButton: "Ajout…",
      updateButton: "Mettre à jour",
      empty: "Aucun paiement pour le moment.",
      noTargets: "Ajoutez d'abord un contrat ou un permis de construire pour enregistrer un paiement.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    buildingModelsSection: {
      title: "Maquettes BIM",
      tableSoftware: "Logiciel",
      tableIfc: "Version IFC",
      tableState: "État",
      softwareLabel: "Logiciel utilisé",
      ifcVersionLabel: "Version IFC",
      fileUrlLabel: "URL du fichier",
      stateLabel: "État de la maquette",
      addButton: "Ajouter",
      addingButton: "Ajout…",
      empty: "Aucune maquette pour le moment.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    modelComponentsSection: {
      title: "Composants de la Maquette",
      tableModel: "Maquette",
      tableElementType: "Type d'élément",
      tableMaterial: "Matériau",
      tableVolume: "Volume (m³)",
      modelLabel: "Maquette BIM",
      globalIdLabel: "Identifiant global",
      elementTypeLabel: "Type d'élément",
      materialLabel: "Matériau",
      volumeLabel: "Volume (m³)",
      areaLabel: "Surface (m²)",
      addButton: "Ajouter",
      addingButton: "Ajout…",
      empty: "Aucun composant pour le moment.",
      noModels: "Ajoutez d'abord une maquette pour ajouter des composants.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    siteProgressSection: {
      title: "Journal de Chantier",
      tableDate: "Date",
      tableDescription: "Description",
      tableProgress: "Avancement",
      tableWeather: "Météo",
      descriptionLabel: "Description",
      percentLabel: "Pourcentage d'avancement",
      weatherLabel: "Météo",
      workersLabel: "Ouvriers sur site",
      addButton: "Ajouter une entrée",
      addingButton: "Ajout…",
      empty: "Aucune entrée pour le moment.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    },
    documentVersionsSection: {
      title: "Versions des Documents",
      tableDocument: "Document",
      tableVersion: "Version",
      tableChange: "Modification",
      documentLabel: "Document",
      versionLabel: "Numéro de version",
      fileUrlLabel: "URL du fichier",
      changeLabel: "Description de la modification",
      addButton: "Ajouter",
      addingButton: "Ajout…",
      empty: "Aucune version pour le moment.",
      noDocuments: "Ajoutez d'abord un document pour enregistrer une version.",
      errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
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
    privateNav: {
      dashboard: "لوحة التحكم",
      users: "المستخدمون",
      projects: "المشاريع",
      signedInAs: "مسجّل الدخول باسم",
      searchPlaceholder: "بحث…",
    },
    searchSection: {
      title: "البحث",
      resultsFor: "نتائج البحث عن",
      tableType: "النوع",
      tableMatch: "النتيجة",
      tableContext: "السياق",
      empty: "لم يتم العثور على نتائج.",
      emptyQuery: "اكتب شيئاً للبحث في المستخدمين والمشاريع.",
      types: {
        user: "مستخدم",
        project: "مشروع",
        document: "مستند",
        task: "مهمة",
        clarification: "طلب توضيح",
        permit: "رخصة",
        proposal: "عرض",
      },
    },
    dashboardSection: {
      greeting: "مرحباً بعودتك",
      statUsers: "المستخدمون",
      statProjects: "المشاريع",
      statActiveProjects: "المشاريع النشطة",
    },
    projectTabs: {
      overview: "نظرة عامة",
      teamPhases: "الفريق والمراحل",
      workflow: "سير العمل",
      permits: "الرخص",
      financial: "الشؤون المالية",
      bimSite: "BIM والورش",
      bimSiteTooltip: "BIM: Building Information Modeling — نموذج رقمي ثلاثي الأبعاد للمبنى",
    },
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
      allRoles: "كل الأدوار",
      filterLabel: "الدور",
      exportButton: "تصدير",
      importButton: "استيراد",
    },
    usersImport: {
      title: "استيراد المستخدمين",
      instructions: "ارفع ملف CSV يحتوي على سطر عناوين بهذه الأسماء بالضبط:",
      columns: "email, password, firstName, lastName, phone, cin, userType, status",
      fileLabel: "ملف CSV",
      importButton: "استيراد",
      importingButton: "جارٍ الاستيراد…",
      back: "رجوع",
      resultCreated: "تم إنشاؤهم",
      resultFailed: "فشلوا",
      errorNoFile: "اختر ملف CSV أولاً.",
      errorEmptyFile: "الملف لا يحتوي على أي بيانات.",
      errorRow: "السطر",
    },
    manageProjects: "إدارة المشاريع",
    projectsAdmin: {
      title: "المشاريع",
      addProject: "إضافة مشروع",
      tableTitle: "العنوان",
      tableClient: "العميل",
      tableStatus: "الحالة",
      tableBudget: "الميزانية (درهم)",
      edit: "تعديل",
      back: "رجوع",
      titleLabel: "العنوان",
      clientLabel: "العميل",
      descriptionLabel: "الوصف",
      cadastralLabel: "الرقم العقاري",
      landSurfaceLabel: "مساحة الأرض (م²)",
      builtSurfaceLabel: "المساحة المبنية (م²)",
      budgetMinLabel: "الميزانية الدنيا (درهم)",
      budgetMaxLabel: "الميزانية القصوى (درهم)",
      statusLabel: "الحالة",
      statuses: {
        draft: "مسودة",
        topo_needed: "بحاجة إلى مسح طوبوغرافي",
        sketching: "التصميم الأولي",
        client_review: "مراجعة العميل",
        rokhas_submitted: "تم إيداع رخصة البناء",
        rokhas_rejected: "رُفضت رخصة البناء",
        taxes_pending: "الضرائب قيد الأداء",
        permit_issued: "تم إصدار الرخصة",
        construction: "قيد البناء",
        occupancy_pending: "بانتظار رخصة السكن",
        closed: "مغلق",
      },
      saveButton: "حفظ التغييرات",
      savingButton: "جارٍ الحفظ…",
      createButton: "إنشاء المشروع",
      creatingButton: "جارٍ الإنشاء…",
      closeButton: "إغلاق المشروع",
      closingButton: "جارٍ الإغلاق…",
      errorGeneric: "حدث خطأ ما. تحقق من الحقول وحاول مرة أخرى.",
      errorForbidden: "ليس لديك صلاحية الوصول إلى هذه الصفحة.",
    },
    projectTeam: {
      title: "فريق المشروع",
      tableName: "الاسم",
      tableRole: "الدور",
      tableActive: "الحالة",
      active: "نشط",
      inactive: "غير نشط",
      remove: "إزالة",
      reactivate: "إعادة التفعيل",
      addMemberTitle: "إضافة عضو",
      memberLabel: "المستخدم",
      roleLabel: "الدور",
      roles: {
        architect: "مهندس معماري",
        bet_engineer: "مكتب دراسات",
        rebar_controller: "مراقب حديد التسليح",
        topographer: "مساح طوبوغرافي",
        main_contractor: "المقاول الرئيسي",
      },
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      empty: "لا يوجد أعضاء بعد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
      errorDuplicate: "هذا المستخدم لديه بالفعل هذا الدور في هذا المشروع.",
    },
    projectPhases: {
      title: "المراحل",
      tableOrder: "#",
      tableName: "الاسم",
      tableStatus: "الحالة",
      tableProgress: "التقدم",
      addPhaseTitle: "إضافة مرحلة",
      nameLabel: "الاسم",
      orderLabel: "الترتيب",
      statusLabel: "الحالة",
      statuses: { not_started: "لم تبدأ", active: "جارية", completed: "مكتملة" },
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      updateButton: "تحديث",
      empty: "لا توجد مراحل بعد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    projectTasksSection: {
      title: "المهام",
      tablePhase: "المرحلة",
      tableTitle: "المهمة",
      tableAssignee: "المكلَّف",
      tableStatus: "الحالة",
      phaseLabel: "المرحلة",
      titleLabel: "المهمة",
      assigneeLabel: "المكلَّف",
      unassigned: "غير مُسندة",
      statusLabel: "الحالة",
      statuses: { todo: "قيد الانتظار", in_progress: "قيد التنفيذ", review: "مراجعة", done: "منجزة" },
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      updateButton: "تحديث",
      empty: "لا توجد مهام بعد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    projectDocumentsSection: {
      title: "المستندات",
      tableTitle: "العنوان",
      tableType: "النوع",
      tableStatus: "الحالة",
      titleLabel: "العنوان",
      fileUrlLabel: "رابط الملف",
      typeLabel: "النوع",
      statusLabel: "الحالة",
      statuses: { WIP: "قيد الإنجاز", Shared: "مشترك", Published: "منشور", Archived: "مؤرشف" },
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      updateButton: "تحديث",
      empty: "لا توجد مستندات بعد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    projectClarifications: {
      title: "طلبات التوضيح",
      tableQuestion: "السؤال",
      tablePriority: "الأولوية",
      tableStatus: "الحالة",
      questionLabel: "السؤال",
      priorityLabel: "الأولوية",
      priorities: { low: "منخفضة", medium: "متوسطة", high: "عالية" },
      statusLabel: "الحالة",
      statuses: { open: "مفتوح", answered: "تمت الإجابة", closed: "مغلق" },
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      updateButton: "تحديث",
      empty: "لا توجد طلبات بعد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    projectApprovals: {
      title: "طلبات الموافقة",
      tableTitle: "العنوان",
      tableStatus: "الحالة",
      titleLabel: "العنوان",
      descriptionLabel: "الوصف",
      statusLabel: "الحالة",
      statuses: {
        submitted: "مُقدَّمة",
        under_review: "قيد المراجعة",
        approved: "موافَق عليها",
        rejected: "مرفوضة",
        revised: "مُعدَّلة",
      },
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      updateButton: "تحديث",
      empty: "لا توجد طلبات موافقة بعد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    buildingPermitSection: {
      title: "رخصة البناء",
      rokhasRefLabel: "مرجع رخص",
      statusLabel: "الحالة",
      statuses: {
        draft: "مسودة",
        submitted: "تم الإيداع",
        rejected: "مرفوضة",
        approved: "موافَق عليها",
        delivered: "مُسلَّمة",
      },
      civilTaxLabel: "الضريبة المدنية مؤداة",
      urbanTaxLabel: "الضريبة الحضرية مؤداة",
      communeTaxLabel: "ضريبة الجماعة مؤداة",
      totalTaxLabel: "إجمالي مبلغ الضرائب (درهم)",
      saveButton: "حفظ",
      savingButton: "جارٍ الحفظ…",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    occupancyPermitSection: {
      title: "رخصة السكن",
      statusLabel: "الحالة",
      statuses: {
        not_requested: "لم تُطلب",
        inspection_scheduled: "تم تحديد موعد المعاينة",
        compliance_ok: "المطابقة مؤكدة",
        issued: "صادرة",
        rejected: "مرفوضة",
      },
      notesLabel: "ملاحظات المعاينة",
      certificateUrlLabel: "رابط شهادة المطابقة",
      saveButton: "حفظ",
      savingButton: "جارٍ الحفظ…",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    proposalsSection: {
      title: "العروض",
      tableProfessional: "المهني",
      tableAmount: "المبلغ (درهم)",
      tableStatus: "الحالة",
      professionalLabel: "المهني",
      amountLabel: "المبلغ (درهم)",
      textLabel: "نص العرض",
      statusLabel: "الحالة",
      statuses: {
        draft: "مسودة",
        submitted: "مُقدَّم",
        under_review: "قيد المراجعة",
        accepted: "مقبول",
        rejected: "مرفوض",
        withdrawn: "مسحوب",
      },
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      updateButton: "تحديث",
      empty: "لا توجد عروض بعد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    contractsSection: {
      title: "العقود",
      tableProfessional: "المهني",
      tableAmount: "الإجمالي (درهم)",
      tableStatus: "الحالة",
      proposalLabel: "العرض",
      amountLabel: "المبلغ الإجمالي (درهم)",
      statusLabel: "الحالة",
      statuses: { draft: "مسودة", active: "ساري", completed: "منجز", terminated: "مُنهى" },
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      updateButton: "تحديث",
      empty: "لا توجد عقود بعد.",
      noProposals: "أضف عرضاً أولاً لإنشاء عقد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    paymentsSection: {
      title: "المدفوعات",
      tableTarget: "من أجل",
      tableAmount: "المبلغ (درهم)",
      tableType: "النوع",
      tableStatus: "الحالة",
      targetLabel: "من أجل",
      contractOption: "عقد",
      permitOption: "رخصة البناء",
      amountLabel: "المبلغ (درهم)",
      typeLabel: "النوع",
      types: { contract_fee: "أتعاب العقد", tax: "ضريبة", other: "أخرى" },
      methodLabel: "طريقة الدفع",
      methods: { bank_transfer: "تحويل بنكي", cash: "نقداً", check: "شيك" },
      statusLabel: "الحالة",
      statuses: { pending: "قيد الانتظار", completed: "مكتمل", failed: "فاشل", refunded: "مُسترد" },
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      updateButton: "تحديث",
      empty: "لا توجد مدفوعات بعد.",
      noTargets: "أضف عقداً أو رخصة بناء أولاً لتسجيل دفعة.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    buildingModelsSection: {
      title: "نماذج BIM",
      tableSoftware: "البرنامج",
      tableIfc: "إصدار IFC",
      tableState: "الحالة",
      softwareLabel: "البرنامج المستخدم",
      ifcVersionLabel: "إصدار IFC",
      fileUrlLabel: "رابط الملف",
      stateLabel: "حالة النموذج",
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      empty: "لا توجد نماذج بعد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    modelComponentsSection: {
      title: "مكونات النموذج",
      tableModel: "النموذج",
      tableElementType: "نوع العنصر",
      tableMaterial: "المادة",
      tableVolume: "الحجم (م³)",
      modelLabel: "نموذج BIM",
      globalIdLabel: "المعرّف العام",
      elementTypeLabel: "نوع العنصر",
      materialLabel: "المادة",
      volumeLabel: "الحجم (م³)",
      areaLabel: "المساحة (م²)",
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      empty: "لا توجد مكونات بعد.",
      noModels: "أضف نموذجاً أولاً لإضافة مكونات.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    siteProgressSection: {
      title: "سجل تقدم الورش",
      tableDate: "التاريخ",
      tableDescription: "الوصف",
      tableProgress: "التقدم",
      tableWeather: "الطقس",
      descriptionLabel: "الوصف",
      percentLabel: "نسبة الإنجاز",
      weatherLabel: "الطقس",
      workersLabel: "عدد العمال في الموقع",
      addButton: "إضافة تسجيل",
      addingButton: "جارٍ الإضافة…",
      empty: "لا توجد تسجيلات بعد.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
    documentVersionsSection: {
      title: "إصدارات المستندات",
      tableDocument: "المستند",
      tableVersion: "الإصدار",
      tableChange: "التعديل",
      documentLabel: "المستند",
      versionLabel: "رقم الإصدار",
      fileUrlLabel: "رابط الملف",
      changeLabel: "وصف التعديل",
      addButton: "إضافة",
      addingButton: "جارٍ الإضافة…",
      empty: "لا توجد إصدارات بعد.",
      noDocuments: "أضف مستنداً أولاً لتسجيل إصدار.",
      errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    },
  },
};
