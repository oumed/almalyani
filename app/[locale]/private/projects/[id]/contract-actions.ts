"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { contracts, projectProposals, projects } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type ContractActionState = { error?: string };

const STATUSES = ["draft", "active", "completed", "terminated"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addContract(
  projectId: string,
  _prevState: ContractActionState,
  formData: FormData
): Promise<ContractActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.contractsSection.errorGeneric };

  const proposalId = String(formData.get("proposalId") ?? "");
  const totalAmount = Number(formData.get("totalAmount") ?? 0) || 0;
  if (!proposalId) return { error: dict.contractsSection.errorGeneric };

  const [proposal] = await db
    .select()
    .from(projectProposals)
    .where(and(eq(projectProposals.id, proposalId), eq(projectProposals.projectId, projectId)))
    .limit(1);
  if (!proposal) return { error: dict.contractsSection.errorGeneric };

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return { error: dict.contractsSection.errorGeneric };

  try {
    await db.insert(contracts).values({
      proposalId,
      projectId,
      clientId: project.clientId,
      professionalId: proposal.professionalId,
      status: "draft",
      attributes: {
        total_amount: totalAmount,
        terms_conditions: "",
        signed_date: null,
        start_date: null,
        end_date: null,
        documents: [],
      },
    });
  } catch {
    return { error: dict.contractsSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function updateContractStatus(
  contractId: string,
  projectId: string,
  locale: Locale,
  formData: FormData
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await db
    .update(contracts)
    .set({ status })
    .where(and(eq(contracts.id, contractId), eq(contracts.projectId, projectId)));

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
}
