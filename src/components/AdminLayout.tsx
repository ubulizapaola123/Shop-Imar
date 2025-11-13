import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { DashboardSubHeader } from "./DashboardSubHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      
      <div className="flex-1 flex flex-col bg-muted/50">
        <Navbar />
        <DashboardSubHeader />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
