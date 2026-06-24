"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteChrome({
  children,
  customer,
}: {
  children: ReactNode;
  customer: { fullName: string } | null;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <main>{children}</main>;

  return (
    <>
      <Header customer={customer} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
