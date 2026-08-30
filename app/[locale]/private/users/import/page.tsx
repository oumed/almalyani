import { notFound, redirect } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { ImportForm } from "./ImportForm";

export default async function ImportUsersPage({
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

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
      <h1 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-foreground">
        {dict.usersImport.title}
      </h1>
      <ImportForm locale={locale} dict={dict} />
    </main>
  );
}
