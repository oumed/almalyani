import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { StatusBadge, statusTone } from "@/components/private/StatusBadge";
import { RoleFilter } from "./RoleFilter";

const VALID_ROLES = ["client", "professional", "admin"] as const;

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];
  const t = dict.usersAdmin;

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== "admin") {
    redirect(`/${locale}/private`);
  }

  const { role } = await searchParams;
  const activeRole = VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]) ? role! : "";

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      userType: users.userType,
      status: users.status,
    })
    .from(users)
    .where(activeRole ? eq(users.userType, activeRole) : undefined)
    .orderBy(users.email);

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-foreground">
          {t.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <RoleFilter locale={locale} role={activeRole} label={t.filterLabel} allLabel={t.allRoles} roles={t.roles} />
          <a
            href={`/${locale}/private/users/export${activeRole ? `?role=${activeRole}` : ""}`}
            className="rounded border border-line px-4 py-2 text-xs font-medium text-foreground hover:bg-line/30"
          >
            {t.exportButton}
          </a>
          <Link
            href={`/${locale}/private/users/import`}
            className="rounded border border-line px-4 py-2 text-xs font-medium text-foreground hover:bg-line/30"
          >
            {t.importButton}
          </Link>
          <Link
            href={`/${locale}/private/users/new`}
            className="rounded bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-accent"
          >
            {t.addUser}
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <th className="px-4 py-3 text-start">{t.tableEmail}</th>
              <th className="px-4 py-3 text-start">{t.tableName}</th>
              <th className="px-4 py-3 text-start">{t.tableRole}</th>
              <th className="px-4 py-3 text-start">{t.tableStatus}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0 hover:bg-line/15">
                <td className="px-4 py-3 text-foreground" dir="ltr">
                  {u.email}
                </td>
                <td className="px-4 py-3 text-foreground">{u.fullName}</td>
                <td className="px-4 py-3 text-muted">{t.roles[u.userType as keyof typeof t.roles] ?? u.userType}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={t.statuses[u.status as keyof typeof t.statuses] ?? u.status}
                    tone={statusTone(u.status)}
                  />
                </td>
                <td className="px-4 py-3 text-end">
                  <Link
                    href={`/${locale}/private/users/${u.id}/edit`}
                    className="text-accent underline underline-offset-4 hover:text-foreground"
                  >
                    {t.edit}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
