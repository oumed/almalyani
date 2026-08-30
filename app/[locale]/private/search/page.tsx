import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  buildingPermits,
  clarificationRequests,
  projectDocuments,
  projectPhases,
  projectProposals,
  projectTasks,
  projects,
  users,
} from "@/db/schema";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

type SearchResultType = "user" | "project" | "document" | "task" | "clarification" | "permit" | "proposal";

type SearchResult = {
  type: SearchResultType;
  label: string;
  context: string;
  href: string;
};

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];
  const t = dict.searchSection;

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== "admin") {
    redirect(`/${locale}/private`);
  }

  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results: SearchResult[] = [];

  if (query) {
    const like = `%${query}%`;

    const userRows = await db
      .select({ id: users.id, fullName: users.fullName, email: users.email })
      .from(users)
      .where(or(ilike(users.email, like), ilike(users.fullName, like)))
      .limit(20);
    for (const u of userRows) {
      results.push({
        type: "user",
        label: u.fullName || u.email,
        context: u.email,
        href: `/${locale}/private/users/${u.id}/edit`,
      });
    }

    const projectRows = await db
      .select({ id: projects.id, title: projects.titleGenerated, cadastral: projects.cadastralGenerated })
      .from(projects)
      .where(or(ilike(projects.titleGenerated, like), ilike(projects.cadastralGenerated, like)))
      .limit(20);
    for (const p of projectRows) {
      results.push({
        type: "project",
        label: p.title || "—",
        context: p.cadastral || "",
        href: `/${locale}/private/projects/${p.id}/edit`,
      });
    }

    const documentRows = await db
      .select({
        id: projectDocuments.id,
        projectId: projectDocuments.projectId,
        title: sql<string>`${projectDocuments.attributes}->>'title'`,
        projectTitle: projects.titleGenerated,
      })
      .from(projectDocuments)
      .innerJoin(projects, eq(projects.id, projectDocuments.projectId))
      .where(ilike(sql<string>`${projectDocuments.attributes}->>'title'`, like))
      .limit(20);
    for (const d of documentRows) {
      results.push({
        type: "document",
        label: d.title || "—",
        context: d.projectTitle || "",
        href: `/${locale}/private/projects/${d.projectId}/edit?tab=workflow`,
      });
    }

    const taskRows = await db
      .select({
        id: projectTasks.id,
        projectId: projectPhases.projectId,
        title: sql<string>`${projectTasks.attributes}->>'title'`,
        projectTitle: projects.titleGenerated,
      })
      .from(projectTasks)
      .innerJoin(projectPhases, eq(projectPhases.id, projectTasks.phaseId))
      .innerJoin(projects, eq(projects.id, projectPhases.projectId))
      .where(ilike(sql<string>`${projectTasks.attributes}->>'title'`, like))
      .limit(20);
    for (const task of taskRows) {
      results.push({
        type: "task",
        label: task.title || "—",
        context: task.projectTitle || "",
        href: `/${locale}/private/projects/${task.projectId}/edit?tab=workflow`,
      });
    }

    const clarificationRows = await db
      .select({
        id: clarificationRequests.id,
        projectId: clarificationRequests.projectId,
        question: sql<string>`${clarificationRequests.attributes}->>'question'`,
        projectTitle: projects.titleGenerated,
      })
      .from(clarificationRequests)
      .innerJoin(projects, eq(projects.id, clarificationRequests.projectId))
      .where(ilike(sql<string>`${clarificationRequests.attributes}->>'question'`, like))
      .limit(20);
    for (const c of clarificationRows) {
      results.push({
        type: "clarification",
        label: c.question || "—",
        context: c.projectTitle || "",
        href: `/${locale}/private/projects/${c.projectId}/edit?tab=workflow`,
      });
    }

    const permitRows = await db
      .select({
        id: buildingPermits.id,
        projectId: buildingPermits.projectId,
        rokhasReference: sql<string>`${buildingPermits.attributes}->>'rokhas_reference'`,
        projectTitle: projects.titleGenerated,
      })
      .from(buildingPermits)
      .innerJoin(projects, eq(projects.id, buildingPermits.projectId))
      .where(ilike(sql<string>`${buildingPermits.attributes}->>'rokhas_reference'`, like))
      .limit(20);
    for (const permit of permitRows) {
      results.push({
        type: "permit",
        label: permit.rokhasReference || "—",
        context: permit.projectTitle || "",
        href: `/${locale}/private/projects/${permit.projectId}/edit?tab=permits`,
      });
    }

    const proposalRows = await db
      .select({
        id: projectProposals.id,
        projectId: projectProposals.projectId,
        professionalName: users.fullName,
        professionalEmail: users.email,
        projectTitle: projects.titleGenerated,
      })
      .from(projectProposals)
      .innerJoin(projects, eq(projects.id, projectProposals.projectId))
      .leftJoin(users, eq(users.id, projectProposals.professionalId))
      .where(and(or(ilike(users.fullName, like), ilike(users.email, like))))
      .limit(20);
    for (const proposal of proposalRows) {
      results.push({
        type: "proposal",
        label: proposal.professionalName || proposal.professionalEmail || "—",
        context: proposal.projectTitle || "",
        href: `/${locale}/private/projects/${proposal.projectId}/edit?tab=financial`,
      });
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
      <h1 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-foreground">{t.title}</h1>

      {query ? (
        <>
          <p className="text-sm text-muted">
            {t.resultsFor} <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
          </p>

          {results.length === 0 ? (
            <p className="text-sm text-muted">{t.empty}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                    <th className="px-4 py-3 text-start">{t.tableType}</th>
                    <th className="px-4 py-3 text-start">{t.tableMatch}</th>
                    <th className="px-4 py-3 text-start">{t.tableContext}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-line last:border-0 hover:bg-line/15">
                      <td className="px-4 py-3 text-muted">{t.types[r.type]}</td>
                      <td className="px-4 py-3">
                        <Link href={r.href} className="text-accent underline underline-offset-4 hover:text-foreground">
                          {r.label}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">{r.context}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">{t.emptyQuery}</p>
      )}
    </main>
  );
}
