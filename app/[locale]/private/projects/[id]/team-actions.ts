"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectTeamMembers } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type TeamActionState = { error?: string };

const ROLES = ["architect", "bet_engineer", "rebar_controller", "topographer", "main_contractor"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "23505";
}

export async function addTeamMember(
  projectId: string,
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.projectTeam.errorGeneric };

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId || !ROLES.includes(role as (typeof ROLES)[number])) {
    return { error: dict.projectTeam.errorGeneric };
  }

  try {
    await db.insert(projectTeamMembers).values({ projectId, userId, role });
  } catch (err) {
    return { error: isUniqueViolation(err) ? dict.projectTeam.errorDuplicate : dict.projectTeam.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function setTeamMemberActive(
  memberId: string,
  projectId: string,
  locale: Locale,
  isActive: boolean
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  await db
    .update(projectTeamMembers)
    .set({ isActive })
    .where(and(eq(projectTeamMembers.id, memberId), eq(projectTeamMembers.projectId, projectId)));

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
}
