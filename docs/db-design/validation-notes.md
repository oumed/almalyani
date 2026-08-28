# Validation notes — DeepSeek schema v1

Source: [DeepSeek chat](https://chat.deepseek.com/share/rf9hnjwtysm5m6fdp4) (imported 2026-08-28).
Files: `deepseek-schema-v1.sql` (verbatim as generated), `deepseek-erd-v1.mmd` (verbatim Mermaid source).

Validated by running the script against a real `postgis/postgis:17-3.4` Docker
container (not just eyeballed) — inserted test rows, checked generated
columns, and exercised the RLS policies with a non-superuser role.

## Bugs found (must fix before this schema is usable)

1. **Partitioning `projects` by `created_at` breaks every foreign key that
   references it.** Postgres requires a partitioned table's PK/unique
   constraints to include the partition key. Once you do that (`(id,
   created_at)`), every other table's `REFERENCES projects(id)` becomes
   invalid, because FK targets must match a unique constraint exactly.
   **This is fatal as written** — the script cannot run with partitioning
   left in place; 15+ downstream tables fail to create.
   → Recommendation: **drop the partitioning** for now. At Almalyani's actual
   scale (a new platform, not millions of rows yet), yearly partitioning is
   premature. Revisit if/when `projects` genuinely grows large — at that
   point partitioning needs to be designed together with the FK graph, not
   bolted on after.

2. **`jsonb_matches_schema(...)` isn't vanilla Postgres — it needs
   `pg_jsonschema`, which the script never installs.** ~~Originally flagged
   as "not a real function" — corrected after checking directly against our
   actual Neon project:~~ **Neon does offer `pg_jsonschema`**
   (`pg_available_extensions` lists it, `default_version 0.3.4`), and it
   works exactly as expected once created — tested directly against our
   Neon dev branch: `CREATE EXTENSION pg_jsonschema; SELECT
   jsonb_matches_schema(...)` returned `true`/`false` correctly. The script's
   actual bug is just a missing line: add `CREATE EXTENSION IF NOT EXISTS
   "pg_jsonschema";` alongside the others. Not a blocker — just incomplete.

3. **`pg_cron` is listed as available on Neon, but won't fire reliably on
   the free tier — confirmed against our actual project config.** Our
   Neon project's `subscription_type` is `free_v3`, and free-tier computes
   auto-suspend after inactivity regardless of `suspend_timeout_seconds`
   (only paid plans can disable autosuspend). `pg_cron`'s scheduler needs an
   always-on background worker; if the compute is suspended when a job is
   due, that tick is simply skipped, not queued.
   → Recommendation stands: run the materialized-view refresh from a Vercel
   Cron Job (free) hitting an API route instead — that connection itself
   wakes the compute, so it works reliably even after autosuspend.

4. **RLS policies need matching `GRANT`s on every table referenced inside
   them, not just the base table.** `professional_project_policy` on
   `projects` subqueries `project_team` — any role that queries `projects`
   also needs `SELECT` on `project_team`, or every query fails outright with
   a permission error (not silently — confirmed by testing). Easy to miss;
   worth a comment in the final script.

## Confirmed working (tested with real inserts)

- Generated columns (`cin`, `phone`, `full_name`, `title_generated`,
  `cadastral_generated`, `budget_min_generated`) compute correctly from the
  JSONB `attributes` on insert.
- The French full-text `search_vector` tokenizes correctly.
- RLS actually restricts rows by `client_id` once permissions are granted
  (tested: owner sees their project, a different `app.current_user_id` sees
  zero rows).

## Compatibility with our actual stack (Neon + Drizzle) — the real "does it work for us" question

Almalyani's `db/index.ts` uses `drizzle-orm/neon-http` — the stateless HTTP
driver (one query per request, no persistent session). This matters a lot
for this schema's RLS design, which depends on `current_setting
('app.current_user_id', true)` being set on the same connection/transaction
as the query that reads it:

- **Drizzle's own `db.transaction(...)` throws immediately on this driver** —
  confirmed by reading `node_modules/drizzle-orm/neon-http/session.js`:
  `"No transactions support in neon-http driver"`. So you cannot do `SET
  LOCAL app.current_user_id = ...` followed by a Drizzle query and expect
  the setting to carry over — every `db.query...` call is its own isolated
  transaction.
- **The underlying `@neondatabase/serverless` HTTP client's own
  `sql.transaction([...])` batching *does* work for this**, confirmed by
  testing directly against our Neon dev branch: a `SET LOCAL` statement and
  a dependent `SELECT current_setting(...)` batched together returned the
  value set moments earlier, in the same call.

Net effect: **RLS-scoped queries (`projects`, `documents`, `rfis`) can't go
through Drizzle's normal query builder as designed** — they'd need either:
  a. raw parameterized SQL via `sql.transaction([...])` for just those
     tables (keeps `neon-http`, loses Drizzle's type-safe builder for that
     slice), or
  b. switching those code paths (or the whole app) to
     `drizzle-orm/neon-serverless` (`Pool` over WebSockets), which supports
     real sessions and `db.transaction()` natively.

This isn't a reason to reject the RLS design — it's a real, workable
pattern (Supabase's `auth.uid()` convention does the same thing) — but it's
a concrete decision to make explicitly when this schema is actually built,
not something to discover mid-implementation.

## Design-level fit against Almalyani's actual scope

This schema is aimed at the *next* phase (client/architect matching,
permits, BIM) — none of which is in scope yet. Per the project's own
constraints, this phase is infrastructure + Coming Soon page only; CRM,
project management, and business functionality are explicitly deferred. So:

- **Do not apply this to the Neon `main`/`preview`/`development` branches
  yet.** `db/schema.ts` stays a placeholder until there's an actual feature
  phase to build against.
- Keep this SQL and diagram as reference material for that future phase —
  it's a strong starting point (the Hot/Cold JSONB split, the Moroccan
  permit workflow modeling from the real architect's process description,
  and the RLS approach are all sound ideas), but it needs the partitioning
  and `jsonb_matches_schema` issues fixed, and translating into Drizzle
  schema + migrations rather than a hand-written SQL file, before it's
  production-ready.
- Missing from this version (noted in the original chat, not part of this
  validation): the assistant's answer to the last question ("static vs.
  dynamic/EAV attributes for the `projects` table") wasn't fully captured —
  worth revisiting that specific design question, since the current design
  already leans dynamic (JSONB `attributes`/`hot_attributes`/
  `cold_attributes` columns) rather than true EAV, which is a reasonable
  middle ground but wasn't an explicit, deliberated decision in what we
  could retrieve.
