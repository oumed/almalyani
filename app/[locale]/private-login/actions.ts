"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { computeAccessToken, PRIVATE_COOKIE_NAME } from "@/lib/private-auth";
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

  const sitePassword = process.env.SITE_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sitePassword || !sessionSecret) {
    return { error: dict.errorNotConfigured };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || password !== sitePassword) {
    return { error: dict.errorIncorrect };
  }

  const token = await computeAccessToken(sessionSecret);
  const cookieStore = await cookies();
  cookieStore.set(PRIVATE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect(`/${locale}/private`);
}

export async function logout(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PRIVATE_COOKIE_NAME);
  redirect(`/${locale}/private-login`);
}
