import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { logout } from "../private-login/actions";

export default async function PrivatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];
  const currentUser = await getCurrentUser();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex max-w-xl flex-col items-center gap-8">
        <p
          className="font-[family-name:var(--font-serif)] text-2xl font-medium tracking-[0.3em] text-accent uppercase"
          dir="ltr"
        >
          {dict.brand}
        </p>

        <div className="flex flex-col gap-3">
          <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            {dict.privateYoureIn}
          </h1>
          <p className="text-base text-muted">{dict.privateBody}</p>
        </div>

        {currentUser?.userType === "admin" && (
          <Link
            href={`/${locale}/private/users`}
            className="text-sm text-accent underline underline-offset-4 hover:text-foreground"
          >
            {dict.manageUsers}
          </Link>
        )}

        <form action={logout.bind(null, locale)}>
          <button
            type="submit"
            className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
          >
            {dict.logoutLabel}
          </button>
        </form>
      </div>
    </main>
  );
}
