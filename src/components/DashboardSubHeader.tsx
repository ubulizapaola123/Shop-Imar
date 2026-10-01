"use client";

import { ShoppingCart, PlusCircle, RotateCcw, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { useSellPoint } from "@/lib/sellpoint-store";
import Link from "next/link";

export function DashboardSubHeader() {
  const { currentUser, settings } = useSellPoint();

  return (
    <div className="border-b border-border bg-[#DCFCE7]/20 px-8 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1F2937]">
            Murakaza neza, <span className="text-[#15803D]">{currentUser?.names || "Operator"}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Current Shift: Guichet Counter 01 • Shop: {settings.shopName}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild size="sm" className="gap-2 bg-[#15803D] hover:bg-[#166534] text-white shadow-sm">
            <Link href="/sell">
              <ShoppingCart className="w-3.5 h-3.5" />
              New Sale
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="gap-2 border-emerald-300 text-[#166534] hover:bg-[#DCFCE7]">
            <Link href="/caisse">
              <Wallet className="w-3.5 h-3.5" />
              Caisse ({settings.caisseBalance.toLocaleString()} Rwf)
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
