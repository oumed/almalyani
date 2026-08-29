"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectDocuments } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type DocumentActionState = { error?: string };

const STATUSES = ["WIP", "Shared", "Published", "Archived"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addDocument(
  projectId: string,
  _prevState: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.projectDocumentsSection.errorGeneric };

  const title = String(formData.get("title") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const documentType = String(formData.get("documentType") ?? "").trim();
  const status = String(formData.get("status") ?? "WIP");

  if (!title || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: dict.projectDocumentsSection.errorGeneric };
  }

  try {
    await db.insert(projectDocuments).values({
      projectId,
      uploadedById: admin.id,
      status,
      attributes: {
        title,
        file_url: fileUrl,
        file_type: "",
        description: "",
        tags: [],
        is_approved_by_client: false,
        document_type: documentType,
      },
    });
  } catch {
    return { error: dict.projectDocumentsSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function updateDocumentStatus(
  documentId: string,
  projectId: string,
  locale: Locale,
  formData: FormData
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await db
    .update(projectDocuments)
    .set({ status })
    .where(and(eq(projectDocuments.id, documentId), eq(projectDocuments.projectId, projectId)));

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
}
