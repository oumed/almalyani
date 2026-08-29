import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import {
  approvalSubmissions,
  clarificationRequests,
  projectDocuments,
  projectPhases,
  projectTasks,
  projectTeamMembers,
  projects,
  users,
} from "@/db/schema";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { ProjectForm } from "../../ProjectForm";
import { updateProject, closeProject } from "../../actions";
import { TeamSection, type TeamMemberRow } from "../TeamSection";
import { PhasesSection, type PhaseRow } from "../PhasesSection";
import { TasksSection, type TaskRow } from "../TasksSection";
import { DocumentsSection, type DocumentRow } from "../DocumentsSection";
import { ClarificationsSection, type ClarificationRow } from "../ClarificationsSection";
import { ApprovalsSection, type ApprovalRow } from "../ApprovalsSection";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== "admin") {
    redirect(`/${locale}/private`);
  }

  const [target] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!target) notFound();

  const clients = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.userType, "client"));

  const allUsers = await db.select({ id: users.id, fullName: users.fullName, email: users.email }).from(users);

  const teamRows = await db
    .select({
      id: projectTeamMembers.id,
      role: projectTeamMembers.role,
      isActive: projectTeamMembers.isActive,
      userName: users.fullName,
      userEmail: users.email,
    })
    .from(projectTeamMembers)
    .leftJoin(users, eq(users.id, projectTeamMembers.userId))
    .where(eq(projectTeamMembers.projectId, target.id));

  const phaseRows = await db
    .select()
    .from(projectPhases)
    .where(eq(projectPhases.projectId, target.id))
    .orderBy(projectPhases.displayOrder);

  const taskRows = await db
    .select({
      id: projectTasks.id,
      phaseId: projectTasks.phaseId,
      phaseName: projectPhases.attributes,
      status: projectTasks.status,
      attributes: projectTasks.attributes,
      assigneeName: users.fullName,
    })
    .from(projectTasks)
    .innerJoin(projectPhases, eq(projectPhases.id, projectTasks.phaseId))
    .leftJoin(users, eq(users.id, projectTasks.assignedToId))
    .where(eq(projectPhases.projectId, target.id));

  const documentRows = await db
    .select()
    .from(projectDocuments)
    .where(eq(projectDocuments.projectId, target.id));

  const clarificationRows = await db
    .select()
    .from(clarificationRequests)
    .where(eq(clarificationRequests.projectId, target.id));

  const approvalRows = await db
    .select()
    .from(approvalSubmissions)
    .where(eq(approvalSubmissions.projectId, target.id));

  const cold = target.coldAttributes as {
    title?: string;
    description?: string;
    cadastral_number?: string;
    land_surface_m2?: number;
    built_surface_m2?: number;
    budget?: { min?: number; max?: number };
  };

  const teamMembers: TeamMemberRow[] = teamRows.map((r) => ({
    id: r.id,
    role: r.role,
    isActive: r.isActive,
    userName: r.userName,
    userEmail: r.userEmail ?? "",
  }));

  const phases: PhaseRow[] = phaseRows.map((p) => {
    const attrs = p.attributes as { name?: string; progress_pct?: number };
    return {
      id: p.id,
      displayOrder: p.displayOrder,
      status: p.status,
      name: attrs.name ?? "",
      progressPct: attrs.progress_pct ?? 0,
    };
  });

  const tasks: TaskRow[] = taskRows.map((r) => {
    const phaseAttrs = r.phaseName as { name?: string };
    const taskAttrs = r.attributes as { title?: string };
    return {
      id: r.id,
      phaseId: r.phaseId,
      phaseName: phaseAttrs.name ?? "",
      title: taskAttrs.title ?? "",
      status: r.status,
      assigneeName: r.assigneeName,
    };
  });

  const documents: DocumentRow[] = documentRows.map((d) => {
    const attrs = d.attributes as { title?: string; file_url?: string; document_type?: string };
    return {
      id: d.id,
      title: attrs.title ?? "",
      fileUrl: attrs.file_url ?? "",
      documentType: attrs.document_type ?? "",
      status: d.status,
    };
  });

  const clarifications: ClarificationRow[] = clarificationRows.map((c) => {
    const attrs = c.attributes as { question?: string; priority?: string };
    return {
      id: c.id,
      question: attrs.question ?? "",
      priority: attrs.priority ?? "medium",
      status: c.status,
    };
  });

  const approvals: ApprovalRow[] = approvalRows.map((a) => {
    const attrs = a.attributes as { title?: string };
    return { id: a.id, title: attrs.title ?? "", status: a.status };
  });

  return (
    <main className="relative flex flex-1 flex-col items-center px-6 py-16 sm:py-24">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
          {cold.title || dict.projectsAdmin.title}
        </h1>

        <ProjectForm
          locale={locale}
          dict={dict}
          action={updateProject.bind(null, target.id)}
          mode="edit"
          clients={clients.map((c) => ({ id: c.id, label: c.fullName || c.email }))}
          initialValues={{
            clientId: target.clientId,
            status: target.status,
            title: cold.title ?? "",
            description: cold.description ?? "",
            cadastralNumber: cold.cadastral_number ?? "",
            landSurface: String(cold.land_surface_m2 ?? ""),
            builtSurface: String(cold.built_surface_m2 ?? ""),
            budgetMin: String(cold.budget?.min ?? ""),
            budgetMax: String(cold.budget?.max ?? ""),
          }}
        />

        {target.status !== "closed" && (
          <form action={closeProject.bind(null, target.id, locale)} className="border-t border-line pt-6">
            <button
              type="submit"
              className="rounded border border-accent/50 px-4 py-2 text-xs font-medium text-accent hover:bg-accent/10"
            >
              {dict.projectsAdmin.closeButton}
            </button>
          </form>
        )}

        <TeamSection
          locale={locale}
          dict={dict}
          projectId={target.id}
          members={teamMembers}
          users={allUsers.map((u) => ({ id: u.id, label: u.fullName || u.email }))}
        />

        <PhasesSection locale={locale} dict={dict} projectId={target.id} phases={phases} />

        <TasksSection
          locale={locale}
          dict={dict}
          projectId={target.id}
          tasks={tasks}
          phases={phases.map((p) => ({ id: p.id, name: p.name }))}
          users={allUsers.map((u) => ({ id: u.id, label: u.fullName || u.email }))}
        />

        <DocumentsSection locale={locale} dict={dict} projectId={target.id} documents={documents} />

        <ClarificationsSection locale={locale} dict={dict} projectId={target.id} clarifications={clarifications} />

        <ApprovalsSection locale={locale} dict={dict} projectId={target.id} approvals={approvals} />
      </div>
    </main>
  );
}
