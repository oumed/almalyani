import Link from "next/link";
import { Search } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { logout } from "../private-login/actions";
import { BrandMonogram } from "@/components/home/BrandMonogram";
import { PrivateLocaleSwitcher } from "./PrivateLocaleSwitcher";

export default async function PrivateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect(`/${locale}/private-login`);

  const isAdmin = currentUser.userType === "admin";
  const navLinks = [
    { href: `/${locale}/private`, label: dict.privateNav.dashboard },
    ...(isAdmin
      ? [
          { href: `/${locale}/private/users`, label: dict.privateNav.users },
          { href: `/${locale}/private/projects`, label: dict.privateNav.projects },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-1 flex-col sm:flex-row">
      <aside className="flex shrink-0 flex-row items-center justify-between gap-4 border-b border-line bg-background px-6 py-4 sm:w-56 sm:flex-col sm:items-stretch sm:justify-start sm:border-b-0 sm:border-e sm:px-5 sm:py-8">
        <Link href={`/${locale}/private`} className="flex items-center gap-2.5">
          <BrandMonogram size={32} />
          <span
            className="font-[family-name:var(--font-serif)] text-sm font-medium tracking-wide text-foreground uppercase"
            dir="ltr"
          >
            {dict.brand}
          </span>
        </Link>

        {isAdmin && (
          <form action={`/${locale}/private/search`} className="hidden sm:mt-8 sm:block">
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute start-2.5 h-4 w-4 text-muted" />
              <input
                type="search"
                name="q"
                placeholder={dict.privateNav.searchPlaceholder}
                className="w-full rounded border border-line bg-transparent py-1.5 ps-8 pe-2 text-sm text-foreground outline-none focus:border-accent"
              />
            </label>
          </form>
        )}

        <nav aria-label="Private area" className="flex flex-row gap-1 sm:mt-6 sm:flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-3 py-2 text-sm font-medium text-muted hover:bg-line/40 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-col gap-3 sm:mt-auto sm:flex">
          <div className="border-t border-line pt-4">
            <PrivateLocaleSwitcher locale={locale} />
          </div>
          <div className="text-xs text-muted">
            <p>{dict.privateNav.signedInAs}</p>
            <p className="truncate font-medium text-foreground" dir="ltr">
              {currentUser.email}
            </p>
          </div>
          <form action={logout.bind(null, locale)}>
            <button
              type="submit"
              className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
            >
              {dict.logoutLabel}
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
