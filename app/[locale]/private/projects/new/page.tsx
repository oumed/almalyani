import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { ProjectForm } from "../ProjectForm";
import { createProject } from "../actions";

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== "admin") {
    redirect(`/${locale}/private`);
  }

  const clients = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.userType, "client"));

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
      <h1 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-foreground">
        {dict.projectsAdmin.addProject}
      </h1>
      <ProjectForm
        locale={locale}
        dict={dict}
        action={createProject}
        mode="create"
        clients={clients.map((c) => ({ id: c.id, label: c.fullName || c.email }))}
      />
    </main>
  );
}
