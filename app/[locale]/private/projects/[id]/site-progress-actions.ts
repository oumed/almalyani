"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { siteProgressLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type SiteProgressActionState = { error?: string };

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addSiteProgressLog(
  projectId: string,
  _prevState: SiteProgressActionState,
  formData: FormData
): Promise<SiteProgressActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.siteProgressSection.errorGeneric };

  const description = String(formData.get("description") ?? "").trim();
  if (!description) return { error: dict.siteProgressSection.errorGeneric };

  try {
    await db.insert(siteProgressLogs).values({
      projectId,
      createdById: admin.id,
      attributes: {
        description,
        percent_complete: Number(formData.get("percentComplete") ?? 0) || 0,
        photos_urls: [],
        weather: String(formData.get("weather") ?? "").trim(),
        workers_count: Number(formData.get("workersCount") ?? 0) || 0,
        materials_delivered: [],
        issues_encountered: [],
      },
    });
  } catch {
    return { error: dict.siteProgressSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}
