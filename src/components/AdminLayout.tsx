"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { DashboardSubHeader } from "./DashboardSubHeader";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      
      <div
        className={cn(
          "flex flex-col bg-muted/50 min-h-screen transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <Navbar />
        <DashboardSubHeader />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
