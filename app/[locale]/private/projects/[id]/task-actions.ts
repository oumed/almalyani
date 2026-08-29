"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectPhases, projectTasks } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type TaskActionState = { error?: string };

const STATUSES = ["todo", "in_progress", "review", "done"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addTask(
  projectId: string,
  _prevState: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.projectTasksSection.errorGeneric };

  const phaseId = String(formData.get("phaseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const assignedToId = String(formData.get("assignedToId") ?? "") || null;
  const status = String(formData.get("status") ?? "todo");

  if (!phaseId || !title || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: dict.projectTasksSection.errorGeneric };
  }

  const [phase] = await db.select().from(projectPhases).where(eq(projectPhases.id, phaseId)).limit(1);
  if (!phase || phase.projectId !== projectId) {
    return { error: dict.projectTasksSection.errorGeneric };
  }

  try {
    await db.insert(projectTasks).values({
      phaseId,
      assignedToId,
      status,
      attributes: { title, description: "", start_date: null, due_date: null, progress_pct: 0, deliverables: [] },
    });
  } catch {
    return { error: dict.projectTasksSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function updateTaskStatus(
  taskId: string,
  phaseId: string,
  locale: Locale,
  formData: FormData
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await db.update(projectTasks).set({ status }).where(and(eq(projectTasks.id, taskId), eq(projectTasks.phaseId, phaseId)));

  const [phase] = await db.select().from(projectPhases).where(eq(projectPhases.id, phaseId)).limit(1);
  if (phase) revalidatePath(`/${locale}/private/projects/${phase.projectId}/edit`);
}
