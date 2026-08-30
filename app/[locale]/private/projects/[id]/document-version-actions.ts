"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { documentVersions, projectDocuments } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type DocumentVersionActionState = { error?: string };

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addDocumentVersion(
  projectId: string,
  _prevState: DocumentVersionActionState,
  formData: FormData
): Promise<DocumentVersionActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.documentVersionsSection.errorGeneric };

  const documentId = String(formData.get("documentId") ?? "");
  const versionNumber = String(formData.get("versionNumber") ?? "").trim() || "V1";
  if (!documentId) return { error: dict.documentVersionsSection.errorGeneric };

  const [doc] = await db
    .select({ id: projectDocuments.id })
    .from(projectDocuments)
    .where(and(eq(projectDocuments.id, documentId), eq(projectDocuments.projectId, projectId)))
    .limit(1);
  if (!doc) return { error: dict.documentVersionsSection.errorGeneric };

  try {
    await db.insert(documentVersions).values({
      documentId,
      createdById: admin.id,
      attributes: {
        version_number: versionNumber,
        file_url: String(formData.get("fileUrl") ?? "").trim(),
        change_description: String(formData.get("changeDescription") ?? "").trim(),
        status_previous: "",
        status_new: "",
      },
    });
  } catch {
    return { error: dict.documentVersionsSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}
