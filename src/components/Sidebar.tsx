"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  PackagePlus,
  Package,
  CreditCard,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Users,
  Database,
  Settings,
  KeyRound,
  LogOut,
  ChevronLeft,
  Store,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSellPoint } from "@/lib/sellpoint-store";
import { UserRole } from "@/types/sellpoint";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  minRole: UserRole;
  isAction?: boolean;
}

interface MenuGroup {
  heading: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    heading: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/", minRole: "Cashier" },
    ],
  },
  {
    heading: "SALES",
    items: [
      { icon: ShoppingCart, label: "Sell", path: "/sell", minRole: "Cashier" },
      { icon: Receipt, label: "Sell List", path: "/sell-list", minRole: "Cashier" },
      { icon: CreditCard, label: "Credit", path: "/credit", minRole: "Cashier" },
    ],
  },
  {
    heading: "INVENTORY",
    items: [
      { icon: Package, label: "Stock", path: "/stock", minRole: "Manager" },
      { icon: PackagePlus, label: "Buy (Restock)", path: "/buy", minRole: "Manager" },
    ],
  },
  {
    heading: "FINANCE",
    items: [
      { icon: Wallet, label: "Caisse (Cash)", path: "/caisse", minRole: "Cashier" },
      { icon: ArrowDownLeft, label: "Income", path: "/income", minRole: "Cashier" },
      { icon: ArrowUpRight, label: "Expenses", path: "/output", minRole: "Cashier" },
      { icon: BarChart3, label: "Profit & Reports", path: "/profit", minRole: "Manager" },
    ],
  },
  {
    heading: "MANAGEMENT",
    items: [
      { icon: Users, label: "Users", path: "/users", minRole: "Admin" },
      { icon: Database, label: "Backup", path: "/backup", minRole: "Admin" },
      { icon: Settings, label: "Settings", path: "/settings", minRole: "Cashier" },
    ],
  },
];

const accountItems: MenuItem[] = [
  { icon: KeyRound, label: "Change Password", path: "/change-password", minRole: "Cashier" },
  { icon: LogOut, label: "Logout", path: "/logout", minRole: "Cashier", isAction: true },
];

// Flat list for external consumers (e.g. Navbar page title map)
export const menuItems = [
  ...menuGroups.flatMap((g) => g.items),
  ...accountItems,
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { currentUser, logout } = useSellPoint();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const canAccess = (itemRole: UserRole): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "Admin") return true;
    if (itemRole === "Manager") return currentUser.role === "Manager";
    if (itemRole === "Admin") return false;
    return true;
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of Sell Point?")) {
      logout();
      router.push("/change-password");
    }
  };

  const renderItem = (item: MenuItem) => {
    const hasAccess = canAccess(item.minRole);
    const isActive = pathname === item.path;

    if (item.isAction) {
      return (
        <button
          key={item.label}
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-destructive hover:bg-red-50",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{item.label}</span>}
        </button>
      );
    }

    if (!hasAccess) {
      return (
        <div
          key={item.path}
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-400 bg-gray-50/50 cursor-not-allowed select-none opacity-60",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? `${item.label} (${item.minRole} only)` : `Restricted to ${item.minRole} role`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4 shrink-0 text-gray-400" />
            {!isCollapsed && <span>{item.label}</span>}
          </div>
          {!isCollapsed && <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        href={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-[#15803D] text-white shadow-sm font-semibold"
            : "text-[#1F2937] hover:bg-[#DCFCE7] hover:text-[#166534]"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-gray-500")} />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50 transition-all duration-300 shadow-sm",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Header / Logo */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#15803D] flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
              <Store className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-lg text-[#166534] tracking-tight block truncate">
                  Sell Point
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block -mt-1">
                  POS &amp; Stock
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-[#DCFCE7] hover:text-[#166534]"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform duration-300 text-muted-foreground", isCollapsed && "rotate-180")}
            />
          </Button>
        </div>
      </div>

      {/* Scrollable menu area */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {/* Main grouped menu */}
        {menuGroups.map((group) => (
          <div key={group.heading}>
            {!isCollapsed && (
              <p className="text-[10px] text-muted-foreground px-2 mb-1.5 uppercase tracking-wider font-bold">
                {group.heading}
              </p>
            )}
            {isCollapsed && (
              <div className="border-t border-border my-2 mx-1" />
            )}
            <nav className="space-y-0.5">
              {group.items.map(renderItem)}
            </nav>
          </div>
        ))}

        {/* Divider + Account section */}
        <div>
          {!isCollapsed ? (
            <>
              <div className="border-t border-border my-2" />
              <p className="text-[10px] text-muted-foreground px-2 mb-1.5 uppercase tracking-wider font-bold">
                ACCOUNT
              </p>
            </>
          ) : (
            <div className="border-t border-border my-2 mx-1" />
          )}
          <nav className="space-y-0.5">
            {accountItems.map(renderItem)}
          </nav>
        </div>
      </div>

      {!isCollapsed && (
        <div className="border-t border-border bg-white p-4">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 border-2 border-[#DCFCE7]">
              <AvatarFallback className="bg-[#15803D] text-xs font-bold text-white">
                {getInitials(currentUser?.names || "Admin User")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#1F2937]">{currentUser?.names || "Admin User"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                <span className="rounded bg-[#DCFCE7] px-1.5 py-0.5 font-semibold text-[#166534]">{currentUser?.role || "Admin"}</span>
                <span className="ml-1">@{currentUser?.username || "admin"}</span>
              </p>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
