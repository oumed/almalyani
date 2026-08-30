import Link from "next/link";
import { notFound } from "next/navigation";
import { count, ne } from "drizzle-orm";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

export default async function PrivatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.userType === "admin";

  if (!isAdmin) {
    return (
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex max-w-xl flex-col items-center gap-3">
          <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            {dict.privateYoureIn}
          </h1>
          <p className="text-base text-muted">{dict.privateBody}</p>
        </div>
      </main>
    );
  }

  const [[{ userCount }], [{ projectCount }], [{ activeProjectCount }]] = await Promise.all([
    db.select({ userCount: count() }).from(users),
    db.select({ projectCount: count() }).from(projects),
    db.select({ activeProjectCount: count() }).from(projects).where(ne(projects.status, "closed")),
  ]);

  const stats = [
    { label: dict.dashboardSection.statUsers, value: userCount, href: `/${locale}/private/users` },
    { label: dict.dashboardSection.statProjects, value: projectCount, href: `/${locale}/private/projects` },
    {
      label: dict.dashboardSection.statActiveProjects,
      value: activeProjectCount,
      href: `/${locale}/private/projects`,
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-10 px-6 py-12 sm:px-10">
      <div>
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-foreground">
          {dict.dashboardSection.greeting}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex flex-col gap-2 rounded-lg border border-line bg-background p-6 transition-colors hover:border-accent/50"
          >
            <span className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">{s.label}</span>
            <span className="font-[family-name:var(--font-serif)] text-4xl font-medium text-foreground" dir="ltr">
              {s.value}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={`/${locale}/private/users/new`}
          className="rounded bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-accent"
        >
          {dict.usersAdmin.addUser}
        </Link>
        <Link
          href={`/${locale}/private/projects/new`}
          className="rounded border border-line px-4 py-2.5 text-sm font-medium text-foreground hover:bg-line/30"
        >
          {dict.projectsAdmin.addProject}
        </Link>
      </div>
    </main>
  );
}
