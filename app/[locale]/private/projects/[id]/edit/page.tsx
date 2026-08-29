import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { ProjectForm } from "../../ProjectForm";
import { updateProject, closeProject } from "../../actions";

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

  const cold = target.coldAttributes as {
    title?: string;
    description?: string;
    cadastral_number?: string;
    land_surface_m2?: number;
    built_surface_m2?: number;
    budget?: { min?: number; max?: number };
  };

  return (
    <main className="relative flex flex-1 flex-col items-center px-6 py-16 sm:py-24">
      <div className="flex w-full max-w-lg flex-col gap-8">
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
      </div>
    </main>
  );
}
