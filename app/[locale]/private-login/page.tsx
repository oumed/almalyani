import { notFound } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
import PrivateLoginForm from "./PrivateLoginForm";

export default async function PrivateLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale];

  return <PrivateLoginForm locale={locale} dict={dict} />;
}
