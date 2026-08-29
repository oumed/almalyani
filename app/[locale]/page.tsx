import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Services } from "@/components/home/Services";
import { Philosophy } from "@/components/home/Philosophy";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/home/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <Header locale={locale} />
      <main className="flex-1">
        <Hero locale={locale} />
        <Services locale={locale} />
        <Philosophy locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
