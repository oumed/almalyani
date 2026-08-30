import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { UserForm } from "../../UserForm";
import { updateUser, banUser } from "../../actions";

export default async function EditUserPage({
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

  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) notFound();

  const attributes = target.attributes as {
    first_name?: string;
    last_name?: string;
    phone?: string;
    cin?: string;
  };

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-foreground" dir="ltr">
          {target.email}
        </h1>

        <UserForm
          locale={locale}
          dict={dict}
          action={updateUser.bind(null, target.id)}
          mode="edit"
          initialValues={{
            email: target.email,
            userType: target.userType,
            status: target.status,
            firstName: attributes.first_name ?? "",
            lastName: attributes.last_name ?? "",
            phone: attributes.phone ?? "",
            cin: attributes.cin ?? "",
          }}
        />

        {target.id !== currentUser.id && (
          <form action={banUser.bind(null, target.id, locale)} className="border-t border-line pt-6">
            <button
              type="submit"
              className="rounded border border-accent/50 px-4 py-2 text-xs font-medium text-accent hover:bg-accent/10"
            >
              {dict.usersAdmin.banButton}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
