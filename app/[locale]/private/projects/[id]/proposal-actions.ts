"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectProposals } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type ProposalActionState = { error?: string };

const STATUSES = ["draft", "submitted", "under_review", "accepted", "rejected", "withdrawn"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addProposal(
  projectId: string,
  _prevState: ProposalActionState,
  formData: FormData
): Promise<ProposalActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.proposalsSection.errorGeneric };

  const professionalId = String(formData.get("professionalId") ?? "");
  const amount = Number(formData.get("amount") ?? 0) || 0;
  const proposalText = String(formData.get("proposalText") ?? "").trim();

  if (!professionalId) return { error: dict.proposalsSection.errorGeneric };

  try {
    await db.insert(projectProposals).values({
      projectId,
      professionalId,
      status: "draft",
      attributes: {
        amount,
        proposal_text: proposalText,
        estimated_duration_days: 0,
        included_services: [],
        valid_until: null,
      },
    });
  } catch {
    return { error: dict.proposalsSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function updateProposalStatus(
  proposalId: string,
  projectId: string,
  locale: Locale,
  formData: FormData
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await db
    .update(projectProposals)
    .set({ status })
    .where(and(eq(projectProposals.id, proposalId), eq(projectProposals.projectId, projectId)));

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
}
