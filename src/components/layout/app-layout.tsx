"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { ThemeSelector } from "@/components/theme-selector";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeSelector />
      <Sidebar />
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
