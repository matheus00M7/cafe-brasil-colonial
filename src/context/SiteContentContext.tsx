"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultSiteContent } from "@/data/site-content";
import type { SiteContent } from "@/types/site-content";

const SiteContentContext = createContext<SiteContent>(defaultSiteContent);

export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: ReactNode;
}) {
  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

export const useSiteContent = () => useContext(SiteContentContext);
