"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSellPoint } from "@/lib/sellpoint-store";
import { AdminLayout } from "@/components/AdminLayout";
import { LogOut } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const { logout, currentUser } = useSellPoint();

  useEffect(() => {
    logout();
    const timer = setTimeout(() => {
      router.push("/change-password");
    }, 800);
    return () => clearTimeout(timer);
  }, [logout, router]);

  return (
    <AdminLayout>
      <div className="p-16 text-center max-w-sm mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center mx-auto animate-pulse">
          <LogOut className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#1F2937]">Logging out...</h3>
        <p className="text-xs text-muted-foreground">
          Returning to Sell Point login screen.
        </p>
      </div>
    </AdminLayout>
  );
}
