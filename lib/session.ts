import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUserId, PRIVATE_COOKIE_NAME } from "@/lib/private-auth";

export type CurrentUser = typeof users.$inferSelect;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PRIVATE_COOKIE_NAME)?.value;
  const userId = await getSessionUserId(token, process.env.SESSION_SECRET);
  if (!userId) return null;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.status !== "active") return null;

  return user;
}
