"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { buildingModels, buildingModelComponents } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type ModelActionState = { error?: string };

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addBuildingModel(
  projectId: string,
  _prevState: ModelActionState,
  formData: FormData
): Promise<ModelActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.buildingModelsSection.errorGeneric };

  const softwareUsed = String(formData.get("softwareUsed") ?? "").trim();
  const ifcVersion = String(formData.get("ifcVersion") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const modelState = String(formData.get("modelState") ?? "WIP").trim();

  try {
    await db.insert(buildingModels).values({
      projectId,
      uploadedById: admin.id,
      attributes: {
        software_used: softwareUsed,
        ifc_version: ifcVersion,
        file_url: fileUrl,
        total_volume: 0,
        total_area: 0,
        model_state: modelState || "WIP",
      },
    });
  } catch {
    return { error: dict.buildingModelsSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function addModelComponent(
  projectId: string,
  _prevState: ModelActionState,
  formData: FormData
): Promise<ModelActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.modelComponentsSection.errorGeneric };

  const buildingModelId = String(formData.get("buildingModelId") ?? "");
  const elementType = String(formData.get("elementType") ?? "").trim();
  if (!buildingModelId || !elementType) return { error: dict.modelComponentsSection.errorGeneric };

  const [model] = await db
    .select({ id: buildingModels.id })
    .from(buildingModels)
    .where(and(eq(buildingModels.id, buildingModelId), eq(buildingModels.projectId, projectId)))
    .limit(1);
  if (!model) return { error: dict.modelComponentsSection.errorGeneric };

  try {
    await db.insert(buildingModelComponents).values({
      buildingModelId,
      attributes: {
        global_id: String(formData.get("globalId") ?? "").trim(),
        element_type: elementType,
        material: String(formData.get("material") ?? "").trim(),
        volume: Number(formData.get("volume") ?? 0) || 0,
        area: Number(formData.get("area") ?? 0) || 0,
        height: 0,
        width: 0,
        geo_json_footprint: null,
        property_sets: {},
        linked_task_id: null,
      },
    });
  } catch {
    return { error: dict.modelComponentsSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}
