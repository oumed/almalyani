import { eq, or } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import {
  approvalSubmissions,
  buildingPermits,
  clarificationRequests,
  contracts,
  occupancyPermits,
  payments,
  projectDocuments,
  projectPhases,
  projectProposals,
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
import { BuildingPermitSection, type BuildingPermitValues } from "../BuildingPermitSection";
import { OccupancyPermitSection, type OccupancyPermitValues } from "../OccupancyPermitSection";
import { ProposalsSection, type ProposalRow } from "../ProposalsSection";
import { ContractsSection, type ContractRow } from "../ContractsSection";
import { PaymentsSection, type PaymentRow } from "../PaymentsSection";

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

  const [buildingPermitRow] = await db
    .select()
    .from(buildingPermits)
    .where(eq(buildingPermits.projectId, target.id))
    .limit(1);

  const [occupancyPermitRow] = await db
    .select()
    .from(occupancyPermits)
    .where(eq(occupancyPermits.projectId, target.id))
    .limit(1);

  const professionals = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.userType, "professional"));

  const proposalRows = await db
    .select({
      id: projectProposals.id,
      status: projectProposals.status,
      attributes: projectProposals.attributes,
      professionalName: users.fullName,
      professionalEmail: users.email,
    })
    .from(projectProposals)
    .leftJoin(users, eq(users.id, projectProposals.professionalId))
    .where(eq(projectProposals.projectId, target.id));

  const contractRows = await db
    .select({
      id: contracts.id,
      status: contracts.status,
      attributes: contracts.attributes,
      professionalName: users.fullName,
      professionalEmail: users.email,
    })
    .from(contracts)
    .leftJoin(users, eq(users.id, contracts.professionalId))
    .where(eq(contracts.projectId, target.id));

  const paymentRows = await db
    .select({
      id: payments.id,
      status: payments.status,
      attributes: payments.attributes,
      contractId: payments.contractId,
      buildingPermitId: payments.buildingPermitId,
      contractProfessionalName: users.fullName,
      contractProfessionalEmail: users.email,
    })
    .from(payments)
    .leftJoin(contracts, eq(contracts.id, payments.contractId))
    .leftJoin(users, eq(users.id, contracts.professionalId))
    .leftJoin(buildingPermits, eq(buildingPermits.id, payments.buildingPermitId))
    .where(
      or(eq(contracts.projectId, target.id), eq(buildingPermits.projectId, target.id))
    );

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

  const buildingPermitAttrs = (buildingPermitRow?.attributes ?? {}) as {
    rokhas_reference?: string;
    is_civil_tax_paid?: boolean;
    is_urban_tax_paid?: boolean;
    is_commune_tax_paid?: boolean;
    total_tax_amount?: number;
  };
  const buildingPermitValues: BuildingPermitValues = {
    rokhasReference: buildingPermitAttrs.rokhas_reference ?? "",
    status: buildingPermitRow?.status ?? "draft",
    isCivilTaxPaid: buildingPermitAttrs.is_civil_tax_paid ?? false,
    isUrbanTaxPaid: buildingPermitAttrs.is_urban_tax_paid ?? false,
    isCommuneTaxPaid: buildingPermitAttrs.is_commune_tax_paid ?? false,
    totalTaxAmount: buildingPermitAttrs.total_tax_amount ?? 0,
  };

  const occupancyPermitAttrs = (occupancyPermitRow?.attributes ?? {}) as {
    inspection_notes?: string;
    compliance_certificate_url?: string;
  };
  const occupancyPermitValues: OccupancyPermitValues = {
    status: occupancyPermitRow?.status ?? "not_requested",
    inspectionNotes: occupancyPermitAttrs.inspection_notes ?? "",
    certificateUrl: occupancyPermitAttrs.compliance_certificate_url ?? "",
  };

  const proposals: ProposalRow[] = proposalRows.map((p) => {
    const attrs = p.attributes as { amount?: number };
    return {
      id: p.id,
      professionalName: p.professionalName || p.professionalEmail || "—",
      amount: attrs.amount ?? 0,
      status: p.status,
    };
  });

  const contractRowsMapped: ContractRow[] = contractRows.map((c) => {
    const attrs = c.attributes as { total_amount?: number };
    return {
      id: c.id,
      professionalName: c.professionalName || c.professionalEmail || "—",
      totalAmount: attrs.total_amount ?? 0,
      status: c.status,
    };
  });

  const paymentTargetLabel = (row: (typeof paymentRows)[number]) =>
    row.contractId
      ? `${dict.paymentsSection.contractOption} — ${row.contractProfessionalName || row.contractProfessionalEmail || "—"}`
      : dict.paymentsSection.permitOption;

  const paymentsMapped: PaymentRow[] = paymentRows.map((p) => {
    const attrs = p.attributes as { amount?: number; payment_type?: string };
    return {
      id: p.id,
      targetLabel: paymentTargetLabel(p),
      amount: attrs.amount ?? 0,
      paymentType: attrs.payment_type ?? "other",
      status: p.status,
    };
  });

  const paymentTargets = [
    ...contractRowsMapped.map((c) => ({
      value: `contract:${c.id}`,
      label: `${dict.paymentsSection.contractOption} — ${c.professionalName}`,
    })),
    ...(buildingPermitRow
      ? [{ value: `permit:${buildingPermitRow.id}`, label: dict.paymentsSection.permitOption }]
      : []),
  ];

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

        <BuildingPermitSection
          key={JSON.stringify(buildingPermitValues)}
          locale={locale}
          dict={dict}
          projectId={target.id}
          values={buildingPermitValues}
        />

        <OccupancyPermitSection
          key={JSON.stringify(occupancyPermitValues)}
          locale={locale}
          dict={dict}
          projectId={target.id}
          values={occupancyPermitValues}
        />

        <ProposalsSection
          locale={locale}
          dict={dict}
          projectId={target.id}
          proposals={proposals}
          professionals={professionals.map((p) => ({ id: p.id, label: p.fullName || p.email }))}
        />

        <ContractsSection
          locale={locale}
          dict={dict}
          projectId={target.id}
          contracts={contractRowsMapped}
          proposals={proposals.map((p) => ({
            id: p.id,
            label: `${p.professionalName} — ${p.amount.toLocaleString()} MAD`,
          }))}
        />

        <PaymentsSection
          locale={locale}
          dict={dict}
          projectId={target.id}
          payments={paymentsMapped}
          targets={paymentTargets}
        />
      </div>
    </main>
  );
}
