"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { parseCsv } from "@/lib/csv";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type ImportState = {
  error?: string;
  created?: number;
  failed?: { row: number; reason: string }[];
};

const USER_TYPES = ["client", "professional", "admin"] as const;
const STATUSES = ["pending", "active", "suspended", "banned"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

export async function importUsers(_prevState: ImportState, formData: FormData): Promise<ImportState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];
  const t = dict.usersImport;

  const admin = await getCurrentUser();
  if (!admin || admin.userType !== "admin") {
    return { error: dict.usersAdmin.errorForbidden };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: t.errorNoFile };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { error: t.errorEmptyFile };
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name.toLowerCase());
  const idx = {
    email: col("email"),
    password: col("password"),
    firstName: col("firstName"),
    lastName: col("lastName"),
    phone: col("phone"),
    cin: col("cin"),
    userType: col("userType"),
    status: col("status"),
  };

  let created = 0;
  const failed: { row: number; reason: string }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    const rowNumber = i + 1;

    const email = (idx.email >= 0 ? cells[idx.email] : "").trim().toLowerCase();
    const password = (idx.password >= 0 ? cells[idx.password] : "").trim();
    const firstName = (idx.firstName >= 0 ? cells[idx.firstName] : "").trim();
    const lastName = (idx.lastName >= 0 ? cells[idx.lastName] : "").trim();
    const phone = (idx.phone >= 0 ? cells[idx.phone] : "").trim();
    const cin = (idx.cin >= 0 ? cells[idx.cin] : "").trim().toUpperCase();
    const userTypeRaw = (idx.userType >= 0 ? cells[idx.userType] : "client").trim().toLowerCase();
    const statusRaw = (idx.status >= 0 ? cells[idx.status] : "active").trim().toLowerCase();

    if (!email || !password) {
      failed.push({ row: rowNumber, reason: "email/password" });
      continue;
    }

    const userType = USER_TYPES.includes(userTypeRaw as (typeof USER_TYPES)[number]) ? userTypeRaw : "client";
    const status = STATUSES.includes(statusRaw as (typeof STATUSES)[number]) ? statusRaw : "active";

    try {
      await db.insert(users).values({
        email,
        passwordHash: await hashPassword(password),
        userType,
        status,
        attributes: { first_name: firstName, last_name: lastName, phone, cin },
      });
      created++;
    } catch {
      failed.push({ row: rowNumber, reason: email });
    }
  }

  return { created, failed };
}
