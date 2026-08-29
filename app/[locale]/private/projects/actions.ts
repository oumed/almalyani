"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type ProjectFormState = { error?: string };

const STATUSES = [
  "draft",
  "topo_needed",
  "sketching",
  "client_review",
  "rokhas_submitted",
  "rokhas_rejected",
  "taxes_pending",
  "permit_issued",
  "construction",
  "occupancy_pending",
  "closed",
] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

function readColdAttributes(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    cadastral_number: String(formData.get("cadastralNumber") ?? "").trim(),
    property_title_number: "",
    land_surface_m2: Number(formData.get("landSurface") ?? 0) || 0,
    built_surface_m2: Number(formData.get("builtSurface") ?? 0) || 0,
    budget: {
      min: Number(formData.get("budgetMin") ?? 0) || 0,
      max: Number(formData.get("budgetMax") ?? 0) || 0,
      currency: "MAD",
    },
    client_expectations: "",
    building_model_id: null,
  };
}

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.projectsAdmin.errorForbidden };

  const clientId = String(formData.get("clientId") ?? "");
  const status = String(formData.get("status") ?? "draft");
  const title = String(formData.get("title") ?? "").trim();

  if (!clientId || !title || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: dict.projectsAdmin.errorGeneric };
  }

  try {
    await db.insert(projects).values({
      clientId,
      status,
      coldAttributes: readColdAttributes(formData),
    });
  } catch {
    return { error: dict.projectsAdmin.errorGeneric };
  }

  redirect(`/${locale}/private/projects`);
}

export async function updateProject(
  projectId: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.projectsAdmin.errorForbidden };

  const clientId = String(formData.get("clientId") ?? "");
  const status = String(formData.get("status") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!clientId || !title || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: dict.projectsAdmin.errorGeneric };
  }

  try {
    await db
      .update(projects)
      .set({
        clientId,
        status,
        coldAttributes: readColdAttributes(formData),
      })
      .where(eq(projects.id, projectId));
  } catch {
    return { error: dict.projectsAdmin.errorGeneric };
  }

  redirect(`/${locale}/private/projects`);
}

export async function closeProject(projectId: string, locale: Locale): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect(`/${locale}/private`);

  await db.update(projects).set({ status: "closed" }).where(eq(projects.id, projectId));
  redirect(`/${locale}/private/projects`);
}
