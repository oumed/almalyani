import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { StatusBadge, statusTone } from "@/components/private/StatusBadge";
import { eq } from "drizzle-orm";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];
  const t = dict.projectsAdmin;

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== "admin") {
    redirect(`/${locale}/private`);
  }

  const allProjects = await db
    .select({
      id: projects.id,
      title: projects.titleGenerated,
      status: projects.status,
      budgetMin: projects.budgetMinGenerated,
      clientName: users.fullName,
      clientEmail: users.email,
    })
    .from(projects)
    .leftJoin(users, eq(users.id, projects.clientId))
    .orderBy(projects.createdAt);

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-foreground">
          {t.title}
        </h1>
        <Link
          href={`/${locale}/private/projects/new`}
          className="rounded bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-accent"
        >
          {t.addProject}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <th className="px-4 py-3 text-start">{t.tableTitle}</th>
              <th className="px-4 py-3 text-start">{t.tableClient}</th>
              <th className="px-4 py-3 text-start">{t.tableStatus}</th>
              <th className="px-4 py-3 text-start">{t.tableBudget}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {allProjects.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-line/15">
                <td className="px-4 py-3 text-foreground">{p.title || "—"}</td>
                <td className="px-4 py-3 text-foreground" dir="ltr">
                  {p.clientName || p.clientEmail || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={t.statuses[p.status as keyof typeof t.statuses] ?? p.status}
                    tone={statusTone(p.status)}
                  />
                </td>
                <td className="px-4 py-3 text-muted" dir="ltr">
                  {p.budgetMin ? Number(p.budgetMin).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-end">
                  <Link
                    href={`/${locale}/private/projects/${p.id}/edit`}
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
