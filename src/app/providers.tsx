"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

import { SellPointProvider } from "@/lib/sellpoint-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <UserProfileProvider>
            <SellPointProvider>
              <Toaster />
              <Sonner />
              {children}
            </SellPointProvider>
          </UserProfileProvider>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
