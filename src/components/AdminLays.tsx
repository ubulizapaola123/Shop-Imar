import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLays({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      
      <div className="flex-1 flex flex-col bg-muted/50">
      <Navbar/>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
