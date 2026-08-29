"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { computeSessionToken, PRIVATE_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/private-auth";
import { verifyPassword } from "@/lib/password";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type LoginState = { error?: string };

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

export async function authenticate(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return { error: dict.errorNotConfigured };
  }

  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return { error: dict.errorIncorrect };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, username.trim().toLowerCase()))
    .limit(1);

  if (!user || user.status !== "active" || !(await verifyPassword(password, user.passwordHash))) {
    return { error: dict.errorIncorrect };
  }

  const token = await computeSessionToken(sessionSecret, user.id);
  const cookieStore = await cookies();
  cookieStore.set(PRIVATE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect(`/${locale}/private`);
}

export async function logout(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PRIVATE_COOKIE_NAME);
  redirect(`/${locale}/private-login`);
}
