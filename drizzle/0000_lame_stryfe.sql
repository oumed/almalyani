-- ============================================================
-- Hand-added: extensions, archive schema, shared trigger function.
-- Must run before the CREATE TABLEs below (pg_jsonschema is required by
-- users_attributes_schema's CHECK; postgis by projects.geo_location;
-- pg_trgm/btree_gin by the GIN indexes generated further down).
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_jsonschema";
-- pg_cron intentionally omitted: it can only be created in the database
-- configured via cron.database_name on this Neon project (not this one),
-- and per validation-notes.md we don't rely on it anyway -- the
-- materialized-view refresh runs via Vercel Cron instead, which wakes an
-- autosuspended free-tier compute; pg_cron's own worker would not.

CREATE SCHEMA IF NOT EXISTS archive;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TABLE "approval_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
        "title": "",
        "description": "",
        "submitted_at": null,
        "response_deadline": null,
        "response_notes": "",
        "approved_by": null,
        "revisions": []
      }'::jsonb NOT NULL,
	CONSTRAINT "approval_submissions_status_check" CHECK ("approval_submissions"."status" IN ('submitted', 'under_review', 'approved', 'rejected', 'revised'))
);
--> statement-breakpoint
CREATE TABLE "building_model_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_model_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
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
      }'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"uploaded_by_id" uuid NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
        "software_used": "",
        "ifc_version": "",
        "file_url": "",
        "total_volume": 0,
        "total_area": 0,
        "model_state": "WIP"
      }'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building_permits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
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
      }'::jsonb NOT NULL,
	CONSTRAINT "building_permits_status_check" CHECK ("building_permits"."status" IN ('draft', 'submitted', 'rejected', 'approved', 'delivered'))
);
--> statement-breakpoint
CREATE TABLE "clarification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"raised_by_id" uuid NOT NULL,
	"assigned_to_id" uuid,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
        "question": "",
        "response": "",
        "priority": "medium",
        "cost_impact": false,
        "schedule_impact": false,
        "date_raised": null,
        "date_answered": null,
        "attachments": []
      }'::jsonb NOT NULL,
	CONSTRAINT "clarification_requests_status_check" CHECK ("clarification_requests"."status" IN ('open', 'answered', 'closed'))
);
--> statement-breakpoint
ALTER TABLE "clarification_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
        "total_amount": 0,
        "terms_conditions": "",
        "signed_date": null,
        "start_date": null,
        "end_date": null,
        "documents": []
      }'::jsonb NOT NULL,
	CONSTRAINT "contracts_status_check" CHECK ("contracts"."status" IN ('draft', 'active', 'completed', 'terminated'))
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{"version_number": "V1", "file_url": "", "change_description": "", "status_previous": "", "status_new": ""}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occupancy_permits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"status" text DEFAULT 'not_requested' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
        "request_date": null,
        "inspection_date": null,
        "inspection_notes": "",
        "compliance_certificate_url": "",
        "issuance_date": null
      }'::jsonb NOT NULL,
	CONSTRAINT "occupancy_permits_status_check" CHECK ("occupancy_permits"."status" IN ('not_requested', 'inspection_scheduled', 'compliance_ok', 'issued', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid,
	"building_permit_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
        "amount": 0,
        "currency": "MAD",
        "payment_type": "contract_fee",
        "method": "bank_transfer",
        "transaction_reference": "",
        "paid_at": null,
        "receipt_url": ""
      }'::jsonb NOT NULL,
	CONSTRAINT "payments_status_check" CHECK ("payments"."status" IN ('pending', 'completed', 'failed', 'refunded')),
	CONSTRAINT "payments_target_check" CHECK (("payments"."contract_id" IS NOT NULL) OR ("payments"."building_permit_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"phase_id" uuid,
	"uploaded_by_id" uuid NOT NULL,
	"status" text DEFAULT 'WIP' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{"title": "", "file_url": "", "file_type": "", "description": "", "tags": [], "is_approved_by_client": false, "document_type": ""}'::jsonb NOT NULL,
	CONSTRAINT "project_documents_status_check" CHECK ("project_documents"."status" IN ('WIP', 'Shared', 'Published', 'Archived'))
);
--> statement-breakpoint
ALTER TABLE "project_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{"name": "", "description": "", "start_date": null, "end_date": null, "progress_pct": 0}'::jsonb NOT NULL,
	CONSTRAINT "project_phases_status_check" CHECK ("project_phases"."status" IN ('not_started', 'active', 'completed'))
);
--> statement-breakpoint
CREATE TABLE "project_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
        "amount": 0,
        "proposal_text": "",
        "estimated_duration_days": 0,
        "included_services": [],
        "valid_until": null
      }'::jsonb NOT NULL,
	CONSTRAINT "project_proposals_status_check" CHECK ("project_proposals"."status" IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'))
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase_id" uuid NOT NULL,
	"assigned_to_id" uuid,
	"status" text DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{"title": "", "description": "", "start_date": null, "due_date": null, "progress_pct": 0, "deliverables": []}'::jsonb NOT NULL,
	CONSTRAINT "project_tasks_status_check" CHECK ("project_tasks"."status" IN ('todo', 'in_progress', 'review', 'done'))
);
--> statement-breakpoint
CREATE TABLE "project_team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{"assigned_date": null, "rate": 0, "notes": ""}'::jsonb NOT NULL,
	CONSTRAINT "project_team_members_role_check" CHECK ("project_team_members"."role" IN ('architect', 'bet_engineer', 'rebar_controller', 'topographer', 'main_contractor'))
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"geo_location" geometry(Point, 4326),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"hot_attributes" jsonb DEFAULT '{
        "rokhas_reference": null,
        "last_rejection_reason": null,
        "submission_history": [],
        "is_civil_tax_paid": false,
        "is_urban_tax_paid": false,
        "is_commune_tax_paid": false,
        "total_tax_amount": 0
      }'::jsonb NOT NULL,
	"cold_attributes" jsonb DEFAULT '{
        "title": "",
        "description": "",
        "cadastral_number": "",
        "property_title_number": "",
        "land_surface_m2": 0,
        "built_surface_m2": 0,
        "budget": {"min": 0, "max": 0, "currency": "MAD"},
        "client_expectations": "",
        "building_model_id": null
      }'::jsonb NOT NULL,
	"title_generated" text GENERATED ALWAYS AS ((cold_attributes->>'title')) STORED,
	"cadastral_generated" text GENERATED ALWAYS AS ((cold_attributes->>'cadastral_number')) STORED,
	"budget_min_generated" numeric GENERATED ALWAYS AS (((cold_attributes->'budget'->>'min')::DECIMAL)) STORED,
	"rokhas_ref_generated" text GENERATED ALWAYS AS ((hot_attributes->>'rokhas_reference')) STORED,
	"search_vector" "tsvector" GENERATED ALWAYS AS ((setweight(to_tsvector('french', COALESCE(cold_attributes->>'title', '')), 'A') || setweight(to_tsvector('arabic', COALESCE(cold_attributes->>'description', '')), 'B'))) STORED,
	CONSTRAINT "projects_status_check" CHECK ("projects"."status" IN ('draft', 'topo_needed', 'sketching', 'client_review', 'rokhas_submitted', 'rokhas_rejected', 'taxes_pending', 'permit_issued', 'construction', 'occupancy_pending', 'closed'))
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "site_progress_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"log_date" date DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
        "description": "",
        "percent_complete": 0,
        "photos_urls": [],
        "weather": "",
        "workers_count": 0,
        "materials_delivered": [],
        "issues_encountered": []
      }'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"user_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attributes" jsonb DEFAULT '{
        "first_name": "",
        "last_name": "",
        "phone": "",
        "cin": "",
        "date_of_birth": null,
        "address": {"street": "", "city": "", "province": "", "commune": "", "postal_code": ""},
        "preferences": {"language": "fr", "notifications": {"email": true, "sms": true}},
        "professional_data": null
      }'::jsonb NOT NULL,
	"cin" text GENERATED ALWAYS AS ((attributes->>'cin')) STORED,
	"phone" text GENERATED ALWAYS AS ((attributes->>'phone')) STORED,
	"full_name" text GENERATED ALWAYS AS ((TRIM(COALESCE(attributes->>'first_name', '') || ' ' || COALESCE(attributes->>'last_name', '')))) STORED,
	"city" text GENERATED ALWAYS AS ((attributes->'address'->>'city')) STORED,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_user_type_check" CHECK ("users"."user_type" IN ('client', 'professional', 'admin')),
	CONSTRAINT "users_status_check" CHECK ("users"."status" IN ('pending', 'active', 'suspended', 'banned')),
	CONSTRAINT "users_attributes_schema" CHECK (jsonb_matches_schema('{
        "type": "object",
        "required": ["first_name", "last_name", "phone", "cin"],
        "properties": {
            "first_name": {"type": "string", "minLength": 2},
            "last_name": {"type": "string", "minLength": 2},
            "phone": {"type": "string", "pattern": "^[0-9]{10}$"},
            "cin": {"type": "string", "pattern": "^[A-Z]{1,2}[0-9]{5,6}$"}
        }
      }', "users"."attributes"))
);
--> statement-breakpoint
ALTER TABLE "approval_submissions" ADD CONSTRAINT "approval_submissions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_model_components" ADD CONSTRAINT "building_model_components_building_model_id_building_models_id_fk" FOREIGN KEY ("building_model_id") REFERENCES "public"."building_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_models" ADD CONSTRAINT "building_models_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_models" ADD CONSTRAINT "building_models_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_permits" ADD CONSTRAINT "building_permits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clarification_requests" ADD CONSTRAINT "clarification_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clarification_requests" ADD CONSTRAINT "clarification_requests_raised_by_id_users_id_fk" FOREIGN KEY ("raised_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clarification_requests" ADD CONSTRAINT "clarification_requests_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_proposal_id_project_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."project_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_project_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."project_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occupancy_permits" ADD CONSTRAINT "occupancy_permits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_building_permit_id_building_permits_id_fk" FOREIGN KEY ("building_permit_id") REFERENCES "public"."building_permits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_proposals" ADD CONSTRAINT "project_proposals_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_proposals" ADD CONSTRAINT "project_proposals_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_progress_logs" ADD CONSTRAINT "site_progress_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_progress_logs" ADD CONSTRAINT "site_progress_logs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_approvals_project" ON "approval_submissions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_model_components_model" ON "building_model_components" USING btree ("building_model_id");--> statement-breakpoint
CREATE INDEX "idx_model_components_gin" ON "building_model_components" USING gin ("attributes");--> statement-breakpoint
CREATE INDEX "idx_building_models_project" ON "building_models" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_permits_project" ON "building_permits" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_permits_status" ON "building_permits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_permits_rokhas" ON "building_permits" USING btree ((attributes->>'rokhas_reference')) WHERE attributes->>'rokhas_reference' != '';--> statement-breakpoint
CREATE INDEX "idx_clarifications_project" ON "clarification_requests" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_clarifications_status" ON "clarification_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_contracts_project" ON "contracts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_status" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_versions_doc" ON "document_versions" USING btree ("document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_occupancy_project" ON "occupancy_permits" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_payments_contract" ON "payments" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_payments_permit" ON "payments" USING btree ("building_permit_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_documents_project" ON "project_documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_documents_status" ON "project_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_documents_uploaded" ON "project_documents" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "idx_phases_project" ON "project_phases" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_proposals_project" ON "project_proposals" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_proposals_professional" ON "project_proposals" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "idx_proposals_status" ON "project_proposals" USING btree ("status") WHERE "project_proposals"."status" = 'submitted';--> statement-breakpoint
CREATE INDEX "idx_tasks_phase" ON "project_tasks" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_assigned" ON "project_tasks" USING btree ("assigned_to_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_team_members_project_id_user_id_role_key" ON "project_team_members" USING btree ("project_id","user_id","role");--> statement-breakpoint
CREATE INDEX "idx_team_members_project" ON "project_team_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_projects_client_status" ON "projects" USING btree ("client_id","status") WHERE "projects"."status" != 'closed';--> statement-breakpoint
CREATE INDEX "idx_projects_geo" ON "projects" USING gist ("geo_location");--> statement-breakpoint
CREATE INDEX "idx_projects_cadastral" ON "projects" USING btree ("cadastral_generated") WHERE "projects"."cadastral_generated" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_projects_budget" ON "projects" USING btree ("budget_min_generated") WHERE "projects"."budget_min_generated" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_projects_rokhas" ON "projects" USING btree ("rokhas_ref_generated") WHERE "projects"."rokhas_ref_generated" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_projects_hot_gin" ON "projects" USING gin ("hot_attributes");--> statement-breakpoint
CREATE INDEX "idx_projects_cold_gin" ON "projects" USING gin ("cold_attributes");--> statement-breakpoint
CREATE INDEX "idx_projects_open_search" ON "projects" USING btree ("client_id","geo_location") WHERE "projects"."status" IN ('draft', 'sketching', 'rokhas_submitted', 'construction');--> statement-breakpoint
CREATE INDEX "idx_projects_search" ON "projects" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "idx_progress_logs_project" ON "site_progress_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_progress_logs_date" ON "site_progress_logs" USING btree ("log_date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_cin" ON "users" USING btree ("cin") WHERE "users"."cin" IS NOT NULL AND "users"."cin" != '';--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_phone" ON "users" USING btree ("phone") WHERE "users"."phone" IS NOT NULL AND "users"."phone" != '';--> statement-breakpoint
CREATE INDEX "idx_users_type_status" ON "users" USING btree ("user_type","status");--> statement-breakpoint
CREATE INDEX "idx_users_name_trgm" ON "users" USING gin ("full_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_users_attributes_gin" ON "users" USING gin ("attributes");--> statement-breakpoint
CREATE POLICY "clarification_requests_owner_or_team_policy" ON "clarification_requests" AS PERMISSIVE FOR ALL TO public USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = clarification_requests.project_id AND (p.client_id = current_setting('app.current_user_id', true)::uuid OR EXISTS (SELECT 1 FROM project_team_members ptm WHERE ptm.project_id = p.id AND ptm.user_id = current_setting('app.current_user_id', true)::uuid))));--> statement-breakpoint
CREATE POLICY "clarification_requests_admin_policy" ON "clarification_requests" AS PERMISSIVE FOR ALL TO public USING (current_setting('app.user_role', true) = 'admin');--> statement-breakpoint
CREATE POLICY "project_documents_owner_or_team_policy" ON "project_documents" AS PERMISSIVE FOR ALL TO public USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_documents.project_id AND (p.client_id = current_setting('app.current_user_id', true)::uuid OR EXISTS (SELECT 1 FROM project_team_members ptm WHERE ptm.project_id = p.id AND ptm.user_id = current_setting('app.current_user_id', true)::uuid))));--> statement-breakpoint
CREATE POLICY "project_documents_admin_policy" ON "project_documents" AS PERMISSIVE FOR ALL TO public USING (current_setting('app.user_role', true) = 'admin');--> statement-breakpoint
CREATE POLICY "client_project_policy" ON "projects" AS PERMISSIVE FOR ALL TO public USING (client_id = current_setting('app.current_user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "professional_project_policy" ON "projects" AS PERMISSIVE FOR ALL TO public USING (EXISTS (SELECT 1 FROM project_team_members ptm WHERE ptm.project_id = projects.id AND ptm.user_id = current_setting('app.current_user_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "admin_project_policy" ON "projects" AS PERMISSIVE FOR ALL TO public USING (current_setting('app.user_role', true) = 'admin');
-- ============================================================
-- Hand-added: updated_at triggers on every table.
-- ============================================================
CREATE TRIGGER trigger_approval_submissions_updated_at BEFORE UPDATE ON approval_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_building_model_components_updated_at BEFORE UPDATE ON building_model_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_building_models_updated_at BEFORE UPDATE ON building_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_building_permits_updated_at BEFORE UPDATE ON building_permits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_clarification_requests_updated_at BEFORE UPDATE ON clarification_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_document_versions_updated_at BEFORE UPDATE ON document_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_occupancy_permits_updated_at BEFORE UPDATE ON occupancy_permits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_project_documents_updated_at BEFORE UPDATE ON project_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_project_phases_updated_at BEFORE UPDATE ON project_phases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_project_proposals_updated_at BEFORE UPDATE ON project_proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_project_team_members_updated_at BEFORE UPDATE ON project_team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_site_progress_logs_updated_at BEFORE UPDATE ON site_progress_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint

-- ============================================================
-- Hand-added: RLS bug fix (validation-notes.md #4) -- policies on
-- projects/project_documents/clarification_requests subquery
-- project_team_members, so any role evaluating those policies also
-- needs SELECT there, or the query fails outright with a permission
-- error (not silently).
-- ============================================================
GRANT SELECT ON project_team_members TO PUBLIC;--> statement-breakpoint

-- ============================================================
-- Hand-added: materialized view + archival function.
-- Refresh mv_province_stats on a schedule via a Vercel Cron Job hitting
-- an API route, not pg_cron -- see validation-notes.md re: autosuspend
-- on the free tier.
-- ============================================================
CREATE MATERIALIZED VIEW mv_province_stats AS
SELECT
    p.cold_attributes->'address'->>'province' as province,
    p.status,
    COUNT(*) as project_count,
    AVG((p.cold_attributes->'budget'->>'max')::DECIMAL) as avg_budget
FROM projects p
WHERE p.status != 'closed'
GROUP BY province, p.status;--> statement-breakpoint

CREATE UNIQUE INDEX idx_mv_province_stats ON mv_province_stats (province, status);--> statement-breakpoint

CREATE OR REPLACE FUNCTION archive_closed_projects()
RETURNS VOID AS $$
BEGIN
    WITH moved AS (
        DELETE FROM projects
        WHERE status = 'closed' AND created_at < NOW() - INTERVAL '5 years'
        RETURNING *
    )
    INSERT INTO archive.projects SELECT * FROM moved;
END;
$$ LANGUAGE plpgsql;
