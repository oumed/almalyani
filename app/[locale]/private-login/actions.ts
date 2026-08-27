"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { computeAccessToken, PRIVATE_COOKIE_NAME } from "@/lib/private-auth";

export type LoginState = { error?: string };

export async function authenticate(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const sitePassword = process.env.SITE_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sitePassword || !sessionSecret) {
    return { error: "The private area isn't configured yet." };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || password !== sitePassword) {
    return { error: "Incorrect password." };
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

  redirect("/private");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PRIVATE_COOKIE_NAME);
  redirect("/private-login");
}
