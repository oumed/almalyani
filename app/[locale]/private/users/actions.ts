"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type UserFormState = { error?: string };

const USER_TYPES = ["client", "professional", "admin"] as const;
const STATUSES = ["pending", "active", "suspended", "banned"] as const;

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

function readAttributes(formData: FormData) {
  return {
    first_name: String(formData.get("firstName") ?? "").trim(),
    last_name: String(formData.get("lastName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    cin: String(formData.get("cin") ?? "")
      .trim()
      .toUpperCase(),
  };
}

export async function createUser(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.usersAdmin.errorForbidden };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const userType = String(formData.get("userType") ?? "");
  const status = String(formData.get("status") ?? "pending");

  if (
    !email ||
    !password ||
    !USER_TYPES.includes(userType as (typeof USER_TYPES)[number]) ||
    !STATUSES.includes(status as (typeof STATUSES)[number])
  ) {
    return { error: dict.usersAdmin.errorGeneric };
  }

  try {
    await db.insert(users).values({
      email,
      passwordHash: await hashPassword(password),
      userType,
      status,
      attributes: readAttributes(formData),
    });
  } catch (err) {
    return { error: isUniqueViolation(err) ? dict.usersAdmin.errorDuplicate : dict.usersAdmin.errorGeneric };
  }

  redirect(`/${locale}/private/users`);
}

export async function updateUser(
  userId: string,
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.usersAdmin.errorForbidden };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const userType = String(formData.get("userType") ?? "");
  const status = String(formData.get("status") ?? "");

  if (
    !email ||
    !USER_TYPES.includes(userType as (typeof USER_TYPES)[number]) ||
    !STATUSES.includes(status as (typeof STATUSES)[number])
  ) {
    return { error: dict.usersAdmin.errorGeneric };
  }

  try {
    await db
      .update(users)
      .set({
        email,
        userType,
        status,
        attributes: readAttributes(formData),
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      })
      .where(eq(users.id, userId));
  } catch (err) {
    return { error: isUniqueViolation(err) ? dict.usersAdmin.errorDuplicate : dict.usersAdmin.errorGeneric };
  }

  redirect(`/${locale}/private/users`);
}

export async function banUser(userId: string, locale: Locale): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect(`/${locale}/private`);

  await db.update(users).set({ status: "banned" }).where(eq(users.id, userId));
  redirect(`/${locale}/private/users`);
}
