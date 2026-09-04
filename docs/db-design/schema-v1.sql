-- ============================================================
-- DATABASE: almalyani (working name)
-- PostgreSQL 17+ Optimized
-- Architecture: Static Core + Hot/Cold JSONB + Generated Columns
-- Source: DeepSeek chat design session (https://chat.deepseek.com/share/rf9hnjwtysm5m6fdp4)
-- Imported 2026-08-28, validated against a real postgis/postgis:17-3.4
-- container and our own Neon project -- see validation-notes.md.
--
-- v2 (this file): table/column renames for clarity + consistency, audit
-- columns (created_at/updated_at) added to every table, partitioning
-- removed (broke every FK -- see validation-notes.md), pg_jsonschema
-- extension added (was referenced but never installed in v1).
--
-- Applied live 2026-08-29 to all three Neon branches (dev/preview/main) as
-- db/schema.ts + drizzle/0000_lame_stryfe.sql -- see validation-notes.md
-- "Applied to Neon" section for what changed on the way to production
-- (pg_cron dropped, driver switched to neon-serverless). This file stays
-- as the original hand-written reference; the Drizzle migration is the
-- source of truth for the live schema going forward.
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- For JSONB indexing
CREATE EXTENSION IF NOT EXISTS "postgis";          -- For geo_location (optional but recommended)
CREATE EXTENSION IF NOT EXISTS "pg_jsonschema";    -- For jsonb_matches_schema() below
CREATE EXTENSION IF NOT EXISTS "pg_cron";          -- Available on Neon, but see validation-notes.md
                                                    -- re: autosuspend on the free tier before relying on it

-- 2. SCHEMAS
CREATE SCHEMA IF NOT EXISTS archive;               -- For cold historical data

-- 3. SHARED TRIGGER FUNCTION (used by every table below)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE 1: USERS (Identity Hub)
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('client', 'professional', 'admin')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- The Dynamic Universe (Single JSONB for simplicity as User updates are moderate)
    attributes JSONB NOT NULL DEFAULT '{
        "first_name": "",
        "last_name": "",
        "phone": "",
        "cin": "",
        "date_of_birth": null,
        "address": {"street": "", "city": "", "province": "", "commune": "", "postal_code": ""},
        "preferences": {"language": "fr", "notifications": {"email": true, "sms": true}},
        "professional_data": null
    }'::jsonb,

    -- GENERATED COLUMNS (Indexed for Moroccan searches)
    cin TEXT GENERATED ALWAYS AS (attributes->>'cin') STORED,
    phone TEXT GENERATED ALWAYS AS (attributes->>'phone') STORED,
    full_name TEXT GENERATED ALWAYS AS (
        TRIM(COALESCE(attributes->>'first_name', '') || ' ' || COALESCE(attributes->>'last_name', ''))
    ) STORED,
    city TEXT GENERATED ALWAYS AS (attributes->'address'->>'city') STORED
);

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for Users
CREATE UNIQUE INDEX idx_users_cin ON users (cin) WHERE cin IS NOT NULL AND cin != '';
CREATE UNIQUE INDEX idx_users_phone ON users (phone) WHERE phone IS NOT NULL AND phone != '';
CREATE INDEX idx_users_type_status ON users (user_type, status);
CREATE INDEX idx_users_name_trgm ON users USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_users_attributes_gin ON users USING GIN (attributes);

-- JSON Schema Validation (via pg_jsonschema, created above)
ALTER TABLE users ADD CONSTRAINT users_attributes_schema CHECK (
    jsonb_matches_schema('{
        "type": "object",
        "required": ["first_name", "last_name", "phone", "cin"],
        "properties": {
            "first_name": {"type": "string", "minLength": 2},
            "last_name": {"type": "string", "minLength": 2},
            "phone": {"type": "string", "pattern": "^[0-9]{10}$"},
            "cin": {"type": "string", "pattern": "^[A-Z]{1,2}[0-9]{5,6}$"}
        }
    }', attributes)
);

-- ============================================================
-- TABLE 2: PROJECTS (Core)
-- ============================================================
-- NOTE: v1 partitioned this table BY RANGE (created_at). Dropped here --
-- Postgres requires the partition key inside every unique/PK constraint,
-- which breaks every other table's REFERENCES projects(id). See
-- validation-notes.md for the full explanation. Revisit only alongside a
-- redesign of the FK graph, if this table ever needs it at real scale.
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'topo_needed', 'sketching', 'client_review', 'rokhas_submitted',
        'rokhas_rejected', 'taxes_pending', 'permit_issued', 'construction',
        'occupancy_pending', 'closed'
    )),
    geo_location GEOMETRY(Point, 4326), -- PostGIS spatial index
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- HOT ATTRIBUTES (Frequently updated: status flags, Rokhas refs, rejection reasons)
    hot_attributes JSONB NOT NULL DEFAULT '{
        "rokhas_reference": null,
        "last_rejection_reason": null,
        "submission_history": [],
        "is_civil_tax_paid": false,
        "is_urban_tax_paid": false,
        "is_commune_tax_paid": false,
        "total_tax_amount": 0
    }'::jsonb,

    -- COLD ATTRIBUTES (Rarely updated: Cadastre, Budget, BIM links, Descriptions)
    cold_attributes JSONB NOT NULL DEFAULT '{
        "title": "",
        "description": "",
        "cadastral_number": "",
        "property_title_number": "",
        "land_surface_m2": 0,
        "built_surface_m2": 0,
        "budget": {"min": 0, "max": 0, "currency": "MAD"},
        "client_expectations": "",
        "building_model_id": null
    }'::jsonb,

    -- GENERATED COLUMNS (Blazing fast filtering without parsing JSON every time)
    title_generated TEXT GENERATED ALWAYS AS (cold_attributes->>'title') STORED,
    cadastral_generated TEXT GENERATED ALWAYS AS (cold_attributes->>'cadastral_number') STORED,
    budget_min_generated DECIMAL GENERATED ALWAYS AS ((cold_attributes->'budget'->>'min')::DECIMAL) STORED,
    rokhas_ref_generated TEXT GENERATED ALWAYS AS (hot_attributes->>'rokhas_reference') STORED
);

CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for Projects (Surgical Covering indexes)
CREATE INDEX idx_projects_client_status ON projects (client_id, status) WHERE status != 'closed';
CREATE INDEX idx_projects_geo ON projects USING GIST (geo_location);
CREATE INDEX idx_projects_cadastral ON projects (cadastral_generated) WHERE cadastral_generated IS NOT NULL;
CREATE INDEX idx_projects_budget ON projects (budget_min_generated) WHERE budget_min_generated IS NOT NULL;
CREATE INDEX idx_projects_rokhas ON projects (rokhas_ref_generated) WHERE rokhas_ref_generated IS NOT NULL;
-- GIN index for searching inside hot/cold JSONB (use with caution, but useful for admin dashboards)
CREATE INDEX idx_projects_hot_gin ON projects USING GIN (hot_attributes);
CREATE INDEX idx_projects_cold_gin ON projects USING GIN (cold_attributes);

-- Partial index for "Open Projects" only
CREATE INDEX idx_projects_open_search ON projects (client_id, geo_location)
WHERE status IN ('draft', 'sketching', 'rokhas_submitted', 'construction');

-- Full-Text Search (French/Arabic)
ALTER TABLE projects ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('french', COALESCE(cold_attributes->>'title', '')), 'A') ||
    setweight(to_tsvector('arabic', COALESCE(cold_attributes->>'description', '')), 'B')
) STORED;

CREATE INDEX idx_projects_search ON projects USING GIN (search_vector);

-- ============================================================
-- TABLE 3: PROJECT_TEAM_MEMBERS (Supervision)
-- was: project_team -- renamed for consistency with the schema's
-- plural-table convention ("team" is a collective noun; every other
-- table names the row-level entity).
-- ============================================================
CREATE TABLE project_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('architect', 'bet_engineer', 'rebar_controller', 'topographer', 'main_contractor')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{"assigned_date": null, "rate": 0, "notes": ""}',
    UNIQUE(project_id, user_id, role)
);

CREATE TRIGGER trigger_project_team_members_updated_at BEFORE UPDATE ON project_team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_team_members_project ON project_team_members (project_id);

-- ============================================================
-- TABLE 4: PROJECT_PHASES (WBS)
-- ============================================================
CREATE TABLE project_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'active', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{"name": "", "description": "", "start_date": null, "end_date": null, "progress_pct": 0}'
);

CREATE TRIGGER trigger_project_phases_updated_at BEFORE UPDATE ON project_phases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_phases_project ON project_phases (project_id);

-- ============================================================
-- TABLE 5: PROJECT_TASKS
-- ============================================================
CREATE TABLE project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL, -- was: assigned_to
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{"title": "", "description": "", "start_date": null, "due_date": null, "progress_pct": 0, "deliverables": []}'
);

CREATE TRIGGER trigger_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_tasks_phase ON project_tasks (phase_id);
CREATE INDEX idx_tasks_assigned ON project_tasks (assigned_to_id);

-- ============================================================
-- TABLE 6: PROJECT_DOCUMENTS (ISO 19650 CDE)
-- was: documents -- renamed to name its scope explicitly.
-- ============================================================
CREATE TABLE project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL,
    uploaded_by_id UUID NOT NULL REFERENCES users(id), -- was: uploaded_by
    status TEXT NOT NULL DEFAULT 'WIP' CHECK (status IN ('WIP', 'Shared', 'Published', 'Archived')), -- was: cde_status
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{"title": "", "file_url": "", "file_type": "", "description": "", "tags": [], "is_approved_by_client": false, "document_type": ""}'
);

CREATE TRIGGER trigger_project_documents_updated_at BEFORE UPDATE ON project_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_documents_project ON project_documents (project_id);
CREATE INDEX idx_documents_status ON project_documents (status);
CREATE INDEX idx_documents_uploaded ON project_documents (uploaded_by_id);

-- ============================================================
-- TABLE 7: DOCUMENT_VERSIONS (Immutable History)
-- was: document_revisions -- "version" is the more commonly expected term.
-- ============================================================
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES project_documents(id) ON DELETE CASCADE,
    created_by_id UUID NOT NULL REFERENCES users(id), -- was: created_by
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{"version_number": "V1", "file_url": "", "change_description": "", "status_previous": "", "status_new": ""}'
);

CREATE TRIGGER trigger_document_versions_updated_at BEFORE UPDATE ON document_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_versions_doc ON document_versions (document_id);

-- ============================================================
-- TABLE 8: BUILDING_PERMITS (Rokhas + Taxes)
-- ============================================================
CREATE TABLE building_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'rejected', 'approved', 'delivered')),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
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
    }'::jsonb
);

CREATE TRIGGER trigger_building_permits_updated_at BEFORE UPDATE ON building_permits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE UNIQUE INDEX idx_permits_project ON building_permits (project_id);
CREATE INDEX idx_permits_status ON building_permits (status);
CREATE INDEX idx_permits_rokhas ON building_permits ((attributes->>'rokhas_reference')) WHERE attributes->>'rokhas_reference' != '';

-- ============================================================
-- TABLE 9: OCCUPANCY_PERMITS (Permis d'Habiter)
-- ============================================================
CREATE TABLE occupancy_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_requested' CHECK (status IN ('not_requested', 'inspection_scheduled', 'compliance_ok', 'issued', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "request_date": null,
        "inspection_date": null,
        "inspection_notes": "",
        "compliance_certificate_url": "",
        "issuance_date": null
    }'::jsonb
);

CREATE TRIGGER trigger_occupancy_permits_updated_at BEFORE UPDATE ON occupancy_permits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE UNIQUE INDEX idx_occupancy_project ON occupancy_permits (project_id);

-- ============================================================
-- TABLE 10: PROJECT_PROPOSALS
-- was: bids -- "bid" reads as an auction; this is a professional's
-- proposal to do the work.
-- ============================================================
CREATE TABLE project_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "amount": 0,
        "proposal_text": "",
        "estimated_duration_days": 0,
        "included_services": [],
        "valid_until": null
    }'::jsonb
);

CREATE TRIGGER trigger_project_proposals_updated_at BEFORE UPDATE ON project_proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_proposals_project ON project_proposals (project_id);
CREATE INDEX idx_proposals_professional ON project_proposals (professional_id);
CREATE INDEX idx_proposals_status ON project_proposals (status) WHERE status = 'submitted';

-- ============================================================
-- TABLE 11: CONTRACTS
-- ============================================================
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES project_proposals(id) ON DELETE CASCADE, -- was: bid_id
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id),
    professional_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'terminated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "total_amount": 0,
        "terms_conditions": "",
        "signed_date": null,
        "start_date": null,
        "end_date": null,
        "documents": []
    }'::jsonb
);

CREATE TRIGGER trigger_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_contracts_project ON contracts (project_id);
CREATE INDEX idx_contracts_status ON contracts (status);

-- ============================================================
-- TABLE 12: PAYMENTS (Supports both Contract Fees & Taxes)
-- ============================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    building_permit_id UUID REFERENCES building_permits(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "amount": 0,
        "currency": "MAD",
        "payment_type": "contract_fee",
        "method": "bank_transfer",
        "transaction_reference": "",
        "paid_at": null,
        "receipt_url": ""
    }'::jsonb,
    CHECK ((contract_id IS NOT NULL) OR (building_permit_id IS NOT NULL))
);

CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_payments_contract ON payments (contract_id);
CREATE INDEX idx_payments_permit ON payments (building_permit_id);
CREATE INDEX idx_payments_status ON payments (status);

-- ============================================================
-- TABLE 13: CLARIFICATION_REQUESTS
-- was: rfis (Request for Information) -- spells out what it is.
-- ============================================================
CREATE TABLE clarification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    raised_by_id UUID NOT NULL REFERENCES users(id), -- was: raised_by
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL, -- was: assigned_to
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "question": "",
        "response": "",
        "priority": "medium",
        "cost_impact": false,
        "schedule_impact": false,
        "date_raised": null,
        "date_answered": null,
        "attachments": []
    }'::jsonb
);

CREATE TRIGGER trigger_clarification_requests_updated_at BEFORE UPDATE ON clarification_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_clarifications_project ON clarification_requests (project_id);
CREATE INDEX idx_clarifications_status ON clarification_requests (status);

-- ============================================================
-- TABLE 14: APPROVAL_SUBMISSIONS
-- was: submittals -- construction-industry jargon; this says what it is.
-- ============================================================
CREATE TABLE approval_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'revised')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "title": "",
        "description": "",
        "submitted_at": null,
        "response_deadline": null,
        "response_notes": "",
        "approved_by": null,
        "revisions": []
    }'::jsonb
);

CREATE TRIGGER trigger_approval_submissions_updated_at BEFORE UPDATE ON approval_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_approvals_project ON approval_submissions (project_id);

-- ============================================================
-- TABLE 15: SITE_PROGRESS_LOGS (Site Diary)
-- was: construction_logs -- clarifies it's a progress diary.
-- ============================================================
CREATE TABLE site_progress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by_id UUID NOT NULL REFERENCES users(id), -- was: created_by
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "description": "",
        "percent_complete": 0,
        "photos_urls": [],
        "weather": "",
        "workers_count": 0,
        "materials_delivered": [],
        "issues_encountered": []
    }'::jsonb
);

CREATE TRIGGER trigger_site_progress_logs_updated_at BEFORE UPDATE ON site_progress_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_progress_logs_project ON site_progress_logs (project_id);
CREATE INDEX idx_progress_logs_date ON site_progress_logs (log_date);

-- ============================================================
-- TABLE 16: BUILDING_MODELS
-- was: bim_models -- drops the BIM acronym; still accurate.
-- ============================================================
CREATE TABLE building_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by_id UUID NOT NULL REFERENCES users(id), -- was: uploaded_by
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "software_used": "",
        "ifc_version": "",
        "file_url": "",
        "total_volume": 0,
        "total_area": 0,
        "model_state": "WIP"
    }'::jsonb
);

CREATE TRIGGER trigger_building_models_updated_at BEFORE UPDATE ON building_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_building_models_project ON building_models (project_id);

-- ============================================================
-- TABLE 17: BUILDING_MODEL_COMPONENTS
-- was: bim_elements -- pairs with building_models, says what it holds.
-- ============================================================
CREATE TABLE building_model_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_model_id UUID NOT NULL REFERENCES building_models(id) ON DELETE CASCADE, -- was: bim_model_id
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
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
    }'::jsonb
);

CREATE TRIGGER trigger_building_model_components_updated_at BEFORE UPDATE ON building_model_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_model_components_model ON building_model_components (building_model_id);
CREATE INDEX idx_model_components_gin ON building_model_components USING GIN (attributes);

-- ============================================================
-- MATERIALIZED VIEW: Province Dashboard
-- ============================================================
CREATE MATERIALIZED VIEW mv_province_stats AS
SELECT
    p.cold_attributes->'address'->>'province' as province,
    p.status,
    COUNT(*) as project_count,
    AVG((p.cold_attributes->'budget'->>'max')::DECIMAL) as avg_budget
FROM projects p
WHERE p.status != 'closed'
GROUP BY province, p.status;

CREATE UNIQUE INDEX idx_mv_province_stats ON mv_province_stats (province, status);
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_province_stats;
-- Refresh this on a schedule via a Vercel Cron Job hitting an API route,
-- not pg_cron -- see validation-notes.md re: Neon free-tier autosuspend.

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Enterprise Security
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clarification_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Clients see only their own projects
CREATE POLICY client_project_policy ON projects
    USING (client_id = current_setting('app.current_user_id', true)::UUID);

-- Policy: Professionals see projects they are assigned to
CREATE POLICY professional_project_policy ON projects
    USING (EXISTS (
        SELECT 1 FROM project_team_members ptm
        WHERE ptm.project_id = projects.id
        AND ptm.user_id = current_setting('app.current_user_id', true)::UUID
    ));

-- Admin bypass (if you set the role to 'admin', they see all)
CREATE POLICY admin_project_policy ON projects
    USING (current_setting('app.user_role', true) = 'admin');

-- ============================================================
-- ARCHIVAL FUNCTION (Run manually or via cron)
-- ============================================================
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
