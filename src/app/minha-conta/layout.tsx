import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { CalendarCheck, LockKeyhole, MapPin, PackageSearch } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LogoutButton } from "@/components/account/LogoutButton";
import { getCustomerSession } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCustomerSession();
  if (!session) redirect("/entrar");
  return (
    <section className="py-10 sm:py-16">
      <Container>
        <div className="mb-8 flex flex-col justify-between gap-5 rounded-4xl bg-brand-brown p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-cream">
              Área do cliente
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">
              Olá, {session.account.profile.fullName.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-white/55">
              {session.account.email}
            </p>
          </div>
          <LogoutButton />
        </div>
        <nav className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [PackageSearch, "Meus pedidos", "/minha-conta"],
            [
              CalendarCheck,
              "Minhas assinaturas",
              "/minha-conta/assinaturas",
            ],
            [MapPin, "Meus dados", "/minha-conta/dados"],
            [LockKeyhole, "Segurança", "/minha-conta/seguranca"],
          ].map(([Icon, label, href]) => (
            <Link
              key={String(href)}
              href={String(href)}
              className="flex items-center gap-3 rounded-2xl border border-brand-brown/10 bg-white px-5 py-4 text-sm font-extrabold text-brand-brown shadow-card transition hover:border-brand-brown/30"
            >
              <Icon className="h-5 w-5 text-brand-green" />
              {String(label)}
            </Link>
          ))}
        </nav>
        {children}
      </Container>
    </section>
  );
}
