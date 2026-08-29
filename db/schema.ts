// Drizzle translation of docs/db-design/schema-v1.sql — see
// docs/db-design/validation-notes.md for the design rationale and the
// issues resolved before this went live (RLS/driver compatibility,
// PostGIS availability, extension list).
//
// What Drizzle can't express is NOT here — it lives in the hand-written
// migration instead: extensions, the shared updated_at trigger function,
// per-table triggers, the mv_province_stats materialized view, and the
// archive_closed_projects() function. See drizzle/0000_extensions_and_*.sql
// and the post-generate additions in the tables migration.
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const geometryPoint = customType<{ data: string }>({
  dataType() {
    return "geometry(Point, 4326)";
  },
});

const tsvectorType = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// ============================================================
// TABLE 1: USERS
// ============================================================
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    userType: text("user_type").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "first_name": "",
        "last_name": "",
        "phone": "",
        "cin": "",
        "date_of_birth": null,
        "address": {"street": "", "city": "", "province": "", "commune": "", "postal_code": ""},
        "preferences": {"language": "fr", "notifications": {"email": true, "sms": true}},
        "professional_data": null
      }'::jsonb`),
    cin: text("cin").generatedAlwaysAs(sql`(attributes->>'cin')`),
    phone: text("phone").generatedAlwaysAs(sql`(attributes->>'phone')`),
    fullName: text("full_name").generatedAlwaysAs(
      sql`(TRIM(COALESCE(attributes->>'first_name', '') || ' ' || COALESCE(attributes->>'last_name', '')))`
    ),
    city: text("city").generatedAlwaysAs(sql`(attributes->'address'->>'city')`),
  },
  (t) => [
    check("users_user_type_check", sql`${t.userType} IN ('client', 'professional', 'admin')`),
    check(
      "users_status_check",
      sql`${t.status} IN ('pending', 'active', 'suspended', 'banned')`
    ),
    check(
      "users_attributes_schema",
      sql`jsonb_matches_schema('{
        "type": "object",
        "required": ["first_name", "last_name", "phone", "cin"],
        "properties": {
            "first_name": {"type": "string", "minLength": 2},
            "last_name": {"type": "string", "minLength": 2},
            "phone": {"type": "string", "pattern": "^[0-9]{10}$"},
            "cin": {"type": "string", "pattern": "^[A-Z]{1,2}[0-9]{5,6}$"}
        }
      }', ${t.attributes})`
    ),
    uniqueIndex("idx_users_cin").on(t.cin).where(sql`${t.cin} IS NOT NULL AND ${t.cin} != ''`),
    uniqueIndex("idx_users_phone").on(t.phone).where(sql`${t.phone} IS NOT NULL AND ${t.phone} != ''`),
    index("idx_users_type_status").on(t.userType, t.status),
    index("idx_users_name_trgm").using("gin", sql`${t.fullName} gin_trgm_ops`),
    index("idx_users_attributes_gin").using("gin", t.attributes),
  ]
);

// ============================================================
// TABLE 2: PROJECTS
// ============================================================
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("draft"),
    geoLocation: geometryPoint("geo_location"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    hotAttributes: jsonb("hot_attributes")
      .notNull()
      .default(sql`'{
        "rokhas_reference": null,
        "last_rejection_reason": null,
        "submission_history": [],
        "is_civil_tax_paid": false,
        "is_urban_tax_paid": false,
        "is_commune_tax_paid": false,
        "total_tax_amount": 0
      }'::jsonb`),
    coldAttributes: jsonb("cold_attributes")
      .notNull()
      .default(sql`'{
        "title": "",
        "description": "",
        "cadastral_number": "",
        "property_title_number": "",
        "land_surface_m2": 0,
        "built_surface_m2": 0,
        "budget": {"min": 0, "max": 0, "currency": "MAD"},
        "client_expectations": "",
        "building_model_id": null
      }'::jsonb`),
    titleGenerated: text("title_generated").generatedAlwaysAs(sql`(cold_attributes->>'title')`),
    cadastralGenerated: text("cadastral_generated").generatedAlwaysAs(
      sql`(cold_attributes->>'cadastral_number')`
    ),
    budgetMinGenerated: numeric("budget_min_generated").generatedAlwaysAs(
      sql`((cold_attributes->'budget'->>'min')::DECIMAL)`
    ),
    rokhasRefGenerated: text("rokhas_ref_generated").generatedAlwaysAs(
      sql`(hot_attributes->>'rokhas_reference')`
    ),
    searchVector: tsvectorType("search_vector").generatedAlwaysAs(
      sql`(setweight(to_tsvector('french', COALESCE(cold_attributes->>'title', '')), 'A') || setweight(to_tsvector('arabic', COALESCE(cold_attributes->>'description', '')), 'B'))`
    ),
  },
  (t) => [
    check(
      "projects_status_check",
      sql`${t.status} IN ('draft', 'topo_needed', 'sketching', 'client_review', 'rokhas_submitted', 'rokhas_rejected', 'taxes_pending', 'permit_issued', 'construction', 'occupancy_pending', 'closed')`
    ),
    index("idx_projects_client_status").on(t.clientId, t.status).where(sql`${t.status} != 'closed'`),
    index("idx_projects_geo").using("gist", t.geoLocation),
    index("idx_projects_cadastral").on(t.cadastralGenerated).where(sql`${t.cadastralGenerated} IS NOT NULL`),
    index("idx_projects_budget").on(t.budgetMinGenerated).where(sql`${t.budgetMinGenerated} IS NOT NULL`),
    index("idx_projects_rokhas").on(t.rokhasRefGenerated).where(sql`${t.rokhasRefGenerated} IS NOT NULL`),
    index("idx_projects_hot_gin").using("gin", t.hotAttributes),
    index("idx_projects_cold_gin").using("gin", t.coldAttributes),
    index("idx_projects_open_search")
      .on(t.clientId, t.geoLocation)
      .where(
        sql`${t.status} IN ('draft', 'sketching', 'rokhas_submitted', 'construction')`
      ),
    index("idx_projects_search").using("gin", t.searchVector),
    pgPolicy("client_project_policy", {
      using: sql`client_id = current_setting('app.current_user_id', true)::uuid`,
    }),
    pgPolicy("professional_project_policy", {
      using: sql`EXISTS (SELECT 1 FROM project_team_members ptm WHERE ptm.project_id = projects.id AND ptm.user_id = current_setting('app.current_user_id', true)::uuid)`,
    }),
    pgPolicy("admin_project_policy", {
      using: sql`current_setting('app.user_role', true) = 'admin'`,
    }),
  ]
).enableRLS();

// ============================================================
// TABLE 3: PROJECT_TEAM_MEMBERS
// ============================================================
export const projectTeamMembers = pgTable(
  "project_team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{"assigned_date": null, "rate": 0, "notes": ""}'::jsonb`),
  },
  (t) => [
    check(
      "project_team_members_role_check",
      sql`${t.role} IN ('architect', 'bet_engineer', 'rebar_controller', 'topographer', 'main_contractor')`
    ),
    uniqueIndex("project_team_members_project_id_user_id_role_key").on(t.projectId, t.userId, t.role),
    index("idx_team_members_project").on(t.projectId),
  ]
);

// ============================================================
// TABLE 4: PROJECT_PHASES
// ============================================================
export const projectPhases = pgTable(
  "project_phases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull().default(0),
    status: text("status").notNull().default("not_started"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(
        sql`'{"name": "", "description": "", "start_date": null, "end_date": null, "progress_pct": 0}'::jsonb`
      ),
  },
  (t) => [
    check("project_phases_status_check", sql`${t.status} IN ('not_started', 'active', 'completed')`),
    index("idx_phases_project").on(t.projectId),
  ]
);

// ============================================================
// TABLE 5: PROJECT_TASKS
// ============================================================
export const projectTasks = pgTable(
  "project_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    phaseId: uuid("phase_id")
      .notNull()
      .references(() => projectPhases.id, { onDelete: "cascade" }),
    assignedToId: uuid("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
    status: text("status").notNull().default("todo"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(
        sql`'{"title": "", "description": "", "start_date": null, "due_date": null, "progress_pct": 0, "deliverables": []}'::jsonb`
      ),
  },
  (t) => [
    check("project_tasks_status_check", sql`${t.status} IN ('todo', 'in_progress', 'review', 'done')`),
    index("idx_tasks_phase").on(t.phaseId),
    index("idx_tasks_assigned").on(t.assignedToId),
  ]
);

// ============================================================
// TABLE 6: PROJECT_DOCUMENTS
// ============================================================
export const projectDocuments = pgTable(
  "project_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    phaseId: uuid("phase_id").references(() => projectPhases.id, { onDelete: "set null" }),
    uploadedById: uuid("uploaded_by_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull().default("WIP"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(
        sql`'{"title": "", "file_url": "", "file_type": "", "description": "", "tags": [], "is_approved_by_client": false, "document_type": ""}'::jsonb`
      ),
  },
  (t) => [
    check("project_documents_status_check", sql`${t.status} IN ('WIP', 'Shared', 'Published', 'Archived')`),
    index("idx_documents_project").on(t.projectId),
    index("idx_documents_status").on(t.status),
    index("idx_documents_uploaded").on(t.uploadedById),
    pgPolicy("project_documents_owner_or_team_policy", {
      using: sql`EXISTS (SELECT 1 FROM projects p WHERE p.id = project_documents.project_id AND (p.client_id = current_setting('app.current_user_id', true)::uuid OR EXISTS (SELECT 1 FROM project_team_members ptm WHERE ptm.project_id = p.id AND ptm.user_id = current_setting('app.current_user_id', true)::uuid)))`,
    }),
    pgPolicy("project_documents_admin_policy", {
      using: sql`current_setting('app.user_role', true) = 'admin'`,
    }),
  ]
).enableRLS();

// ============================================================
// TABLE 7: DOCUMENT_VERSIONS
// ============================================================
export const documentVersions = pgTable(
  "document_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => projectDocuments.id, { onDelete: "cascade" }),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(
        sql`'{"version_number": "V1", "file_url": "", "change_description": "", "status_previous": "", "status_new": ""}'::jsonb`
      ),
  },
  (t) => [index("idx_versions_doc").on(t.documentId)]
);

// ============================================================
// TABLE 8: BUILDING_PERMITS
// ============================================================
export const buildingPermits = pgTable(
  "building_permits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("draft"),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "rokhas_reference": "",
        "application_date": null,
        "delivery_date": null,
        "rejection_reason": "",
        "official_response": "",
        "submission_history": [],
        "is_civil_tax_paid": false,
        "is_urban_tax_paid": false,
        "is_commune_tax_paid": false,
        "total_tax_amount": 0
      }'::jsonb`),
  },
  (t) => [
    check(
      "building_permits_status_check",
      sql`${t.status} IN ('draft', 'submitted', 'rejected', 'approved', 'delivered')`
    ),
    uniqueIndex("idx_permits_project").on(t.projectId),
    index("idx_permits_status").on(t.status),
    index("idx_permits_rokhas")
      .on(sql`(attributes->>'rokhas_reference')`)
      .where(sql`attributes->>'rokhas_reference' != ''`),
  ]
);

// ============================================================
// TABLE 9: OCCUPANCY_PERMITS
// ============================================================
export const occupancyPermits = pgTable(
  "occupancy_permits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("not_requested"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "request_date": null,
        "inspection_date": null,
        "inspection_notes": "",
        "compliance_certificate_url": "",
        "issuance_date": null
      }'::jsonb`),
  },
  (t) => [
    check(
      "occupancy_permits_status_check",
      sql`${t.status} IN ('not_requested', 'inspection_scheduled', 'compliance_ok', 'issued', 'rejected')`
    ),
    uniqueIndex("idx_occupancy_project").on(t.projectId),
  ]
);

// ============================================================
// TABLE 10: PROJECT_PROPOSALS
// ============================================================
export const projectProposals = pgTable(
  "project_proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("draft"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "amount": 0,
        "proposal_text": "",
        "estimated_duration_days": 0,
        "included_services": [],
        "valid_until": null
      }'::jsonb`),
  },
  (t) => [
    check(
      "project_proposals_status_check",
      sql`${t.status} IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn')`
    ),
    index("idx_proposals_project").on(t.projectId),
    index("idx_proposals_professional").on(t.professionalId),
    index("idx_proposals_status").on(t.status).where(sql`${t.status} = 'submitted'`),
  ]
);

// ============================================================
// TABLE 11: CONTRACTS
// ============================================================
export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => projectProposals.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.id),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "total_amount": 0,
        "terms_conditions": "",
        "signed_date": null,
        "start_date": null,
        "end_date": null,
        "documents": []
      }'::jsonb`),
  },
  (t) => [
    check("contracts_status_check", sql`${t.status} IN ('draft', 'active', 'completed', 'terminated')`),
    index("idx_contracts_project").on(t.projectId),
    index("idx_contracts_status").on(t.status),
  ]
);

// ============================================================
// TABLE 12: PAYMENTS
// ============================================================
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "set null" }),
    buildingPermitId: uuid("building_permit_id").references(() => buildingPermits.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "amount": 0,
        "currency": "MAD",
        "payment_type": "contract_fee",
        "method": "bank_transfer",
        "transaction_reference": "",
        "paid_at": null,
        "receipt_url": ""
      }'::jsonb`),
  },
  (t) => [
    check("payments_status_check", sql`${t.status} IN ('pending', 'completed', 'failed', 'refunded')`),
    check(
      "payments_target_check",
      sql`(${t.contractId} IS NOT NULL) OR (${t.buildingPermitId} IS NOT NULL)`
    ),
    index("idx_payments_contract").on(t.contractId),
    index("idx_payments_permit").on(t.buildingPermitId),
    index("idx_payments_status").on(t.status),
  ]
);

// ============================================================
// TABLE 13: CLARIFICATION_REQUESTS
// ============================================================
export const clarificationRequests = pgTable(
  "clarification_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    raisedById: uuid("raised_by_id")
      .notNull()
      .references(() => users.id),
    assignedToId: uuid("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "question": "",
        "response": "",
        "priority": "medium",
        "cost_impact": false,
        "schedule_impact": false,
        "date_raised": null,
        "date_answered": null,
        "attachments": []
      }'::jsonb`),
  },
  (t) => [
    check("clarification_requests_status_check", sql`${t.status} IN ('open', 'answered', 'closed')`),
    index("idx_clarifications_project").on(t.projectId),
    index("idx_clarifications_status").on(t.status),
    pgPolicy("clarification_requests_owner_or_team_policy", {
      using: sql`EXISTS (SELECT 1 FROM projects p WHERE p.id = clarification_requests.project_id AND (p.client_id = current_setting('app.current_user_id', true)::uuid OR EXISTS (SELECT 1 FROM project_team_members ptm WHERE ptm.project_id = p.id AND ptm.user_id = current_setting('app.current_user_id', true)::uuid)))`,
    }),
    pgPolicy("clarification_requests_admin_policy", {
      using: sql`current_setting('app.user_role', true) = 'admin'`,
    }),
  ]
).enableRLS();

// ============================================================
// TABLE 14: APPROVAL_SUBMISSIONS
// ============================================================
export const approvalSubmissions = pgTable(
  "approval_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("submitted"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "title": "",
        "description": "",
        "submitted_at": null,
        "response_deadline": null,
        "response_notes": "",
        "approved_by": null,
        "revisions": []
      }'::jsonb`),
  },
  (t) => [
    check(
      "approval_submissions_status_check",
      sql`${t.status} IN ('submitted', 'under_review', 'approved', 'rejected', 'revised')`
    ),
    index("idx_approvals_project").on(t.projectId),
  ]
);

// ============================================================
// TABLE 15: SITE_PROGRESS_LOGS
// ============================================================
export const siteProgressLogs = pgTable(
  "site_progress_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id),
    logDate: date("log_date").notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "description": "",
        "percent_complete": 0,
        "photos_urls": [],
        "weather": "",
        "workers_count": 0,
        "materials_delivered": [],
        "issues_encountered": []
      }'::jsonb`),
  },
  (t) => [
    index("idx_progress_logs_project").on(t.projectId),
    index("idx_progress_logs_date").on(t.logDate),
  ]
);

// ============================================================
// TABLE 16: BUILDING_MODELS
// ============================================================
export const buildingModels = pgTable(
  "building_models",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    uploadedById: uuid("uploaded_by_id")
      .notNull()
      .references(() => users.id),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "software_used": "",
        "ifc_version": "",
        "file_url": "",
        "total_volume": 0,
        "total_area": 0,
        "model_state": "WIP"
      }'::jsonb`),
  },
  (t) => [index("idx_building_models_project").on(t.projectId)]
);

// ============================================================
// TABLE 17: BUILDING_MODEL_COMPONENTS
// ============================================================
export const buildingModelComponents = pgTable(
  "building_model_components",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    buildingModelId: uuid("building_model_id")
      .notNull()
      .references(() => buildingModels.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{
        "global_id": "",
        "element_type": "",
        "material": "",
        "volume": 0,
        "area": 0,
        "height": 0,
        "width": 0,
        "geo_json_footprint": null,
        "property_sets": {},
        "linked_task_id": null
      }'::jsonb`),
  },
  (t) => [
    index("idx_model_components_model").on(t.buildingModelId),
    index("idx_model_components_gin").using("gin", t.attributes),
  ]
);
