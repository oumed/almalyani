import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// neon-serverless (Pool over WebSockets) instead of neon-http: the RLS
// policies in schema.ts depend on `SET LOCAL app.current_user_id` holding
// for the duration of a query, which requires a real session/transaction.
// neon-http issues one query per request with no persistent session and
// throws on db.transaction(...) -- see docs/db-design/validation-notes.md.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
