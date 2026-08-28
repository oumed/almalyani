-- ============================================================
-- DATABASE: moroccan_architecture_app
-- PostgreSQL 17+ Optimized
-- Architecture: Static Core + Hot/Cold JSONB + Generated Columns
-- Source: DeepSeek chat design session (https://chat.deepseek.com/share/rf9hnjwtysm5m6fdp4)
-- Imported verbatim on 2026-08-28 for review — NOT yet validated or applied.
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- For JSONB indexing
CREATE EXTENSION IF NOT EXISTS "postgis";          -- For geo_location (optional but recommended)
CREATE EXTENSION IF NOT EXISTS "pg_cron";          -- For scheduled refresh of MVs (optional)

-- 2. SCHEMAS
CREATE SCHEMA IF NOT EXISTS archive;               -- For cold historical data

-- ============================================================
-- TABLE 1: USERS (Identity Hub)
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('client', 'professional', 'admin')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

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

-- Indexes for Users
CREATE UNIQUE INDEX idx_users_cin ON users (cin) WHERE cin IS NOT NULL AND cin != '';
CREATE UNIQUE INDEX idx_users_phone ON users (phone) WHERE phone IS NOT NULL AND phone != '';
CREATE INDEX idx_users_type_status ON users (user_type, status);
CREATE INDEX idx_users_name_trgm ON users USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_users_attributes_gin ON users USING GIN (attributes);

-- JSON Schema Validation (PostgreSQL 17 native)
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
-- TABLE 2: PROJECTS (Core - with HOT/COLD Split for performance)
-- ============================================================
-- Master projects table (Static columns only)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'topo_needed', 'sketching', 'client_review', 'rokhas_submitted',
        'rokhas_rejected', 'taxes_pending', 'permit_issued', 'construction',
        'occupancy_pending', 'closed'
    )),
    geo_location GEOMETRY(Point, 4326), -- PostGIS spatial index
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- HOT ATTRIBUTES (Frequently updated: status flags, Rokhas refs, rejection reasons)
    hot_attributes JSONB NOT NULL DEFAULT '{
        "rokhas_reference": null,
        "last_rejection_reason": null,
        "submission_history": [],
        "tax_civil_paid": false,
        "tax_urban_paid": false,
        "tax_commune_paid": false,
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
        "bim_model_id": null
    }'::jsonb,

    -- GENERATED COLUMNS (Blazing fast filtering without parsing JSON every time)
    title_generated TEXT GENERATED ALWAYS AS (cold_attributes->>'title') STORED,
    cadastral_generated TEXT GENERATED ALWAYS AS (cold_attributes->>'cadastral_number') STORED,
    budget_min_generated DECIMAL GENERATED ALWAYS AS ((cold_attributes->'budget'->>'min')::DECIMAL) STORED,
    rokhas_ref_generated TEXT GENERATED ALWAYS AS (hot_attributes->>'rokhas_reference') STORED
) PARTITION BY RANGE (created_at);

-- Create Partitions (Yearly)
CREATE TABLE projects_2025 PARTITION OF projects FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE projects_2026 PARTITION OF projects FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE projects_2027 PARTITION OF projects FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
-- Add more as needed, or use DEFAULT partition for future:
CREATE TABLE projects_default PARTITION OF projects DEFAULT;

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
-- TABLE 3: PROJECT PHASES (WBS)
-- ============================================================
CREATE TABLE project_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'active', 'completed')),
    attributes JSONB NOT NULL DEFAULT '{"name": "", "description": "", "start_date": null, "end_date": null, "progress_pct": 0}'
);
CREATE INDEX idx_phases_project ON project_phases (project_id);

-- ============================================================
-- TABLE 4: PROJECT TASKS
-- ============================================================
CREATE TABLE project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    attributes JSONB NOT NULL DEFAULT '{"title": "", "description": "", "start_date": null, "due_date": null, "progress_pct": 0, "deliverables": []}'
);
CREATE INDEX idx_tasks_phase ON project_tasks (phase_id);
CREATE INDEX idx_tasks_assigned ON project_tasks (assigned_to);

-- ============================================================
-- TABLE 5: PROJECT TEAM (Supervision)
-- ============================================================
CREATE TABLE project_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('architect', 'bet_engineer', 'rebar_controller', 'topographer', 'main_contractor')),
    is_active BOOLEAN DEFAULT TRUE,
    attributes JSONB NOT NULL DEFAULT '{"assigned_date": null, "rate": 0, "notes": ""}',
    UNIQUE(project_id, user_id, role)
);
CREATE INDEX idx_team_project ON project_team (project_id);

-- ============================================================
-- TABLE 6: DOCUMENTS (ISO 19650 CDE)
-- ============================================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    cde_status TEXT NOT NULL DEFAULT 'WIP' CHECK (cde_status IN ('WIP', 'Shared', 'Published', 'Archived')),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{"title": "", "file_url": "", "file_type": "", "description": "", "tags": [], "is_approved_by_client": false, "document_type": ""}'
);
CREATE INDEX idx_docs_project ON documents (project_id);
CREATE INDEX idx_docs_status ON documents (cde_status);
CREATE INDEX idx_docs_uploaded ON documents (uploaded_by);

-- ============================================================
-- TABLE 7: DOCUMENT REVISIONS (Immutable History)
-- ============================================================
CREATE TABLE document_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{"version_number": "V1", "file_url": "", "change_description": "", "status_previous": "", "status_new": ""}'
);
CREATE INDEX idx_revisions_doc ON document_revisions (document_id);

-- ============================================================
-- TABLE 8: BUILDING PERMITS (Rokhas + Taxes)
-- ============================================================
CREATE TABLE building_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'rejected', 'approved', 'delivered')),
    last_sync_at TIMESTAMPTZ,
    attributes JSONB NOT NULL DEFAULT '{
        "rokhas_reference": "",
        "application_date": null,
        "delivery_date": null,
        "rejection_reason": "",
        "official_response": "",
        "submission_history": [],
        "tax_civil_paid": false,
        "tax_urban_paid": false,
        "tax_commune_paid": false,
        "total_tax_amount": 0
    }'::jsonb
);
CREATE UNIQUE INDEX idx_permits_project ON building_permits (project_id);
CREATE INDEX idx_permits_status ON building_permits (status);
CREATE INDEX idx_permits_rokhas ON building_permits ((attributes->>'rokhas_reference')) WHERE attributes->>'rokhas_reference' != '';

-- ============================================================
-- TABLE 9: OCCUPANCY PERMITS (Permis d'Habiter)
-- ============================================================
CREATE TABLE occupancy_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_requested' CHECK (status IN ('not_requested', 'inspection_scheduled', 'compliance_ok', 'issued', 'rejected')),
    attributes JSONB NOT NULL DEFAULT '{
        "request_date": null,
        "inspection_date": null,
        "inspection_notes": "",
        "compliance_certificate_url": "",
        "issuance_date": null
    }'::jsonb
);
CREATE UNIQUE INDEX idx_occupancy_project ON occupancy_permits (project_id);

-- ============================================================
-- TABLE 10: BIDS
-- ============================================================
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "amount": 0,
        "proposal_text": "",
        "estimated_duration_days": 0,
        "included_services": [],
        "valid_until": null
    }'::jsonb
);
CREATE INDEX idx_bids_project ON bids (project_id);
CREATE INDEX idx_bids_professional ON bids (professional_id);
CREATE INDEX idx_bids_status ON bids (status) WHERE status = 'submitted';

-- ============================================================
-- TABLE 11: CONTRACTS
-- ============================================================
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id),
    professional_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'terminated')),
    attributes JSONB NOT NULL DEFAULT '{
        "total_amount": 0,
        "terms_conditions": "",
        "signed_date": null,
        "start_date": null,
        "end_date": null,
        "documents": []
    }'::jsonb
);
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
CREATE INDEX idx_payments_contract ON payments (contract_id);
CREATE INDEX idx_payments_permit ON payments (building_permit_id);
CREATE INDEX idx_payments_status ON payments (status);

-- ============================================================
-- TABLE 13: RFIs (Request for Information)
-- ============================================================
CREATE TABLE rfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
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
CREATE INDEX idx_rfis_project ON rfis (project_id);
CREATE INDEX idx_rfis_status ON rfis (status);

-- ============================================================
-- TABLE 14: SUBMITTALS
-- ============================================================
CREATE TABLE submittals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'revised')),
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
CREATE INDEX idx_submittals_project ON submittals (project_id);

-- ============================================================
-- TABLE 15: CONSTRUCTION LOGS (Site Diary)
-- ============================================================
CREATE TABLE construction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
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
CREATE INDEX idx_logs_project ON construction_logs (project_id);
CREATE INDEX idx_logs_date ON construction_logs (log_date);

-- ============================================================
-- TABLE 16: BIM MODELS
-- ============================================================
CREATE TABLE bim_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    attributes JSONB NOT NULL DEFAULT '{
        "software_used": "",
        "ifc_version": "",
        "file_url": "",
        "total_volume": 0,
        "total_area": 0,
        "model_state": "WIP"
    }'::jsonb
);
CREATE INDEX idx_bim_project ON bim_models (project_id);

-- ============================================================
-- TABLE 17: BIM ELEMENTS
-- ============================================================
CREATE TABLE bim_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bim_model_id UUID NOT NULL REFERENCES bim_models(id) ON DELETE CASCADE,
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
CREATE INDEX idx_elements_model ON bim_elements (bim_model_id);
CREATE INDEX idx_elements_gin ON bim_elements USING GIN (attributes);

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Enterprise Security
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;

-- Policy: Clients see only their own projects
CREATE POLICY client_project_policy ON projects
    USING (client_id = current_setting('app.current_user_id', true)::UUID);

-- Policy: Professionals see projects they are assigned to
CREATE POLICY professional_project_policy ON projects
    USING (EXISTS (
        SELECT 1 FROM project_team pt
        WHERE pt.project_id = projects.id
        AND pt.user_id = current_setting('app.current_user_id', true)::UUID
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
