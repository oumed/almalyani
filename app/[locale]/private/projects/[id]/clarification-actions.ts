"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { clarificationRequests } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type ClarificationActionState = { error?: string };

const STATUSES = ["open", "answered", "closed"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addClarification(
  projectId: string,
  _prevState: ClarificationActionState,
  formData: FormData
): Promise<ClarificationActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.projectClarifications.errorGeneric };

  const question = String(formData.get("question") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium");

  if (!question || !PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return { error: dict.projectClarifications.errorGeneric };
  }

  try {
    await db.insert(clarificationRequests).values({
      projectId,
      raisedById: admin.id,
      status: "open",
      attributes: {
        question,
        response: "",
        priority,
        cost_impact: false,
        schedule_impact: false,
        date_raised: new Date().toISOString(),
        date_answered: null,
        attachments: [],
      },
    });
  } catch {
    return { error: dict.projectClarifications.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function updateClarificationStatus(
  clarificationId: string,
  projectId: string,
  locale: Locale,
  formData: FormData
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await db
    .update(clarificationRequests)
    .set({ status })
    .where(and(eq(clarificationRequests.id, clarificationId), eq(clarificationRequests.projectId, projectId)));

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
}
