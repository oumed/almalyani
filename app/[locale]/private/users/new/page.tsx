import { notFound, redirect } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { UserForm } from "../UserForm";
import { createUser } from "../actions";

export default async function NewUserPage({
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
    <main className="relative flex flex-1 flex-col items-center px-6 py-16 sm:py-24">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
          {dict.usersAdmin.addUser}
        </h1>
        <UserForm locale={locale} dict={dict} action={createUser} mode="create" />
      </div>
    </main>
  );
}
