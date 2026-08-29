"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { buildingPermits, occupancyPermits } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type PermitActionState = { error?: string };

const BUILDING_STATUSES = ["draft", "submitted", "rejected", "approved", "delivered"] as const;
const OCCUPANCY_STATUSES = [
  "not_requested",
  "inspection_scheduled",
  "compliance_ok",
  "issued",
  "rejected",
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

export async function saveBuildingPermit(
  projectId: string,
  _prevState: PermitActionState,
  formData: FormData
): Promise<PermitActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.buildingPermitSection.errorGeneric };

  const status = String(formData.get("status") ?? "draft");
  if (!BUILDING_STATUSES.includes(status as (typeof BUILDING_STATUSES)[number])) {
    return { error: dict.buildingPermitSection.errorGeneric };
  }

  const attributes = {
    rokhas_reference: String(formData.get("rokhasReference") ?? "").trim(),
    application_date: null,
    delivery_date: null,
    rejection_reason: "",
    official_response: "",
    submission_history: [],
    is_civil_tax_paid: formData.get("civilTaxPaid") === "on",
    is_urban_tax_paid: formData.get("urbanTaxPaid") === "on",
    is_commune_tax_paid: formData.get("communeTaxPaid") === "on",
    total_tax_amount: Number(formData.get("totalTaxAmount") ?? 0) || 0,
  };

  try {
    const [existing] = await db
      .select({ id: buildingPermits.id })
      .from(buildingPermits)
      .where(eq(buildingPermits.projectId, projectId))
      .limit(1);

    if (existing) {
      await db.update(buildingPermits).set({ status, attributes }).where(eq(buildingPermits.id, existing.id));
    } else {
      await db.insert(buildingPermits).values({ projectId, status, attributes });
    }
  } catch {
    return { error: dict.buildingPermitSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function saveOccupancyPermit(
  projectId: string,
  _prevState: PermitActionState,
  formData: FormData
): Promise<PermitActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.occupancyPermitSection.errorGeneric };

  const status = String(formData.get("status") ?? "not_requested");
  if (!OCCUPANCY_STATUSES.includes(status as (typeof OCCUPANCY_STATUSES)[number])) {
    return { error: dict.occupancyPermitSection.errorGeneric };
  }

  const attributes = {
    request_date: null,
    inspection_date: null,
    inspection_notes: String(formData.get("inspectionNotes") ?? "").trim(),
    compliance_certificate_url: String(formData.get("certificateUrl") ?? "").trim(),
    issuance_date: null,
  };

  try {
    const [existing] = await db
      .select({ id: occupancyPermits.id })
      .from(occupancyPermits)
      .where(eq(occupancyPermits.projectId, projectId))
      .limit(1);

    if (existing) {
      await db.update(occupancyPermits).set({ status, attributes }).where(eq(occupancyPermits.id, existing.id));
    } else {
      await db.insert(occupancyPermits).values({ projectId, status, attributes });
    }
  } catch {
    return { error: dict.occupancyPermitSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}
