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

2. **`jsonb_matches_schema(...)` is not a real PostgreSQL function.**
   DeepSeek's comment calls it "PostgreSQL 17 native," but vanilla Postgres
   has no built-in JSON Schema validation. This exists only via the
   `pg_jsonschema` extension (used by Supabase) — not available on Neon by
   default, and not confirmed installable there.
   → Recommendation: either drop this constraint and validate shape at the
   application layer (Drizzle + zod, simplest), or swap in Postgres-native
   `CHECK` constraints on the specific fields that matter (e.g. regex on
   `attributes->>'phone'`).

3. **`pg_cron` is unlikely to be available on Neon's free tier** (it's a
   superuser-installed extension; Neon supports it on some plans but this
   needs confirming before relying on it — don't assume). The materialized
   view refresh it's meant to schedule can instead run from a Vercel Cron
   Job (already $0 on Vercel's free tier) hitting an API route that runs
   `REFRESH MATERIALIZED VIEW`.

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
