"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div
        className={cn(
          "flex flex-col bg-white min-h-screen transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-72"
        )}
      >
        <Navbar />

        <main className="flex-1 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
