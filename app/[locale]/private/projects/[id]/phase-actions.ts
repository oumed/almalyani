"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectPhases } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type PhaseActionState = { error?: string };

const STATUSES = ["not_started", "active", "completed"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addPhase(
  projectId: string,
  _prevState: PhaseActionState,
  formData: FormData
): Promise<PhaseActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.projectPhases.errorGeneric };

  const name = String(formData.get("name") ?? "").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 0) || 0;
  const status = String(formData.get("status") ?? "not_started");
  if (!name || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: dict.projectPhases.errorGeneric };
  }

  try {
    await db.insert(projectPhases).values({
      projectId,
      displayOrder,
      status,
      attributes: { name, description: "", start_date: null, end_date: null, progress_pct: 0 },
    });
  } catch {
    return { error: dict.projectPhases.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function updatePhaseStatus(
  phaseId: string,
  projectId: string,
  locale: Locale,
  formData: FormData
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  const progressPct = status === "completed" ? 100 : status === "not_started" ? 0 : undefined;

  const [phase] = await db.select().from(projectPhases).where(eq(projectPhases.id, phaseId)).limit(1);
  if (!phase || phase.projectId !== projectId) return;

  const attributes = phase.attributes as Record<string, unknown>;

  await db
    .update(projectPhases)
    .set({
      status,
      attributes:
        progressPct === undefined ? attributes : { ...attributes, progress_pct: progressPct },
    })
    .where(and(eq(projectPhases.id, phaseId), eq(projectPhases.projectId, projectId)));

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
}
