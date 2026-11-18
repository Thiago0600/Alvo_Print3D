"use client";
import { createContext, useContext } from "react";
import { DEFAULT_COMPANY, type CompanySettings } from "@/lib/site";

const Ctx = createContext<CompanySettings>(DEFAULT_COMPANY);

export function SiteProvider({ company, children }: { company: CompanySettings; children: React.ReactNode }) {
  return <Ctx.Provider value={company}>{children}</Ctx.Provider>;
}

export const useCompany = () => useContext(Ctx);
