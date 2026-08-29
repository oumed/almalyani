import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];
  const t = dict.usersAdmin;

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== "admin") {
    redirect(`/${locale}/private`);
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      userType: users.userType,
      status: users.status,
    })
    .from(users)
    .orderBy(users.email);

  return (
    <main className="relative flex flex-1 flex-col items-center px-6 py-16 sm:py-24">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            {t.title}
          </h1>
          <Link
            href={`/${locale}/private/users/new`}
            className="rounded bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-accent"
          >
            {t.addUser}
          </Link>
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
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-foreground" dir="ltr">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-foreground">{u.fullName}</td>
                  <td className="px-4 py-3 text-muted">{t.roles[u.userType as keyof typeof t.roles] ?? u.userType}</td>
                  <td className="px-4 py-3 text-muted">
                    {t.statuses[u.status as keyof typeof t.statuses] ?? u.status}
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

        <Link href={`/${locale}/private`} className="text-sm text-muted underline underline-offset-4 hover:text-foreground">
          {t.back}
        </Link>
      </div>
    </main>
  );
}
