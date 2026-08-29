"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { approvalSubmissions } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type ApprovalActionState = { error?: string };

const STATUSES = ["submitted", "under_review", "approved", "rejected", "revised"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addApproval(
  projectId: string,
  _prevState: ApprovalActionState,
  formData: FormData
): Promise<ApprovalActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.projectApprovals.errorGeneric };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return { error: dict.projectApprovals.errorGeneric };

  try {
    await db.insert(approvalSubmissions).values({
      projectId,
      status: "submitted",
      attributes: {
        title,
        description,
        submitted_at: new Date().toISOString(),
        response_deadline: null,
        response_notes: "",
        approved_by: null,
        revisions: [],
      },
    });
  } catch {
    return { error: dict.projectApprovals.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function updateApprovalStatus(
  approvalId: string,
  projectId: string,
  locale: Locale,
  formData: FormData
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await db
    .update(approvalSubmissions)
    .set({ status })
    .where(and(eq(approvalSubmissions.id, approvalId), eq(approvalSubmissions.projectId, projectId)));

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
}
