"use client";

import {
  Search,
  Bell,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  Package,
  ChevronDown,
  User as UserIcon,
  Settings as SettingsIcon,
  KeyRound,
  LogOut,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useSellPoint } from "@/lib/sellpoint-store";
import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Navbar() {
  const router = useRouter();
  const { notifications, markRead, dismissNotification, unreadCount } = useUserProfile();
  const { currentUser, logout, switchUserRole } = useSellPoint();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const query = searchTerm.toLowerCase();
    if (query.includes("sell") || query.includes("order")) {
      router.push("/sell-list");
    } else if (query.includes("stock") || query.includes("product") || query.includes("item")) {
      router.push("/stock");
    } else if (query.includes("credit") || query.includes("debt")) {
      router.push("/credit");
    } else if (query.includes("cash") || query.includes("caisse")) {
      router.push("/caisse");
    } else {
      router.push("/stock");
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "credit":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "stock":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getNotifBg = (type: string) => {
    switch (type) {
      case "sale":
      case "stock":
        return "bg-emerald-50 text-emerald-600";
      case "alert":
        return "bg-amber-50 text-amber-600";
      case "credit":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <header className="h-16 border-b border-border bg-white sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* ── Search Bar (Left / Center) ── */}
      <form onSubmit={handleGlobalSearch} className="relative w-72 sm:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={searchInputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search product, client, bill..."
          className="pl-9 pr-12 h-9 bg-[#F9FAFB] border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#15803D] focus-visible:bg-white transition-all shadow-none"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded tracking-widest">
            ⌘K
          </kbd>
        </div>
      </form>

      {/* ── Right Actions ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-[#DCFCE7] hover:text-[#166534]"
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={cn(
              "relative p-2 rounded-lg transition-colors text-gray-500 hover:text-[#166534] hover:bg-[#DCFCE7]/50",
              notifOpen && "bg-[#DCFCE7]/60 text-[#166534]"
            )}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Floating Notification Panel */}
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[360px] bg-white rounded-xl shadow-xl border border-border z-50 p-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-xs">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className="group relative flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 transition-all text-left cursor-pointer"
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          getNotifBg(notif.type)
                        )}
                      >
                        {getNotifIcon(notif.type)}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-xs font-bold text-gray-900 leading-snug">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                          {notif.message}
                        </p>
                        {notif.actionLink && notif.actionText && (
                          <Link
                            href={notif.actionLink}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifOpen(false);
                            }}
                            className="inline-block text-[11px] font-semibold text-[#15803D] hover:underline mt-1"
                          >
                            {notif.actionText}
                          </Link>
                        )}
                      </div>

                      {/* Close / Dismiss 'x' button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notif.id);
                        }}
                        className="absolute top-2.5 right-2 text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* User Pill with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none select-none">
              <div className="w-7 h-7 rounded-full bg-[#15803D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {currentUser ? getInitials(currentUser.names) : "AU"}
              </div>
              <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
                {currentUser?.names || "Admin User"}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b border-border">
              <p className="font-bold text-xs text-[#1F2937]">{currentUser?.names || "Admin User"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.2 bg-[#DCFCE7] text-[#166534] font-semibold rounded">
                  {currentUser?.role || "Admin"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  @{currentUser?.username || "admin"}
                </span>
              </div>
            </div>

            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer text-xs flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-xs flex items-center gap-2">
                <SettingsIcon className="w-3.5 h-3.5 text-gray-500" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/change-password" className="cursor-pointer text-xs flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-gray-500" />
                <span>Change Password</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Switch Role option in profile menu */}
            <DropdownMenuLabel className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              Switch Role
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => switchUserRole("Admin")}
              className="cursor-pointer text-xs flex items-center justify-between"
            >
              <span>Admin</span>
              {currentUser?.role === "Admin" && <span className="text-[10px] text-[#15803D] font-bold">Active</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchUserRole("Manager")}
              className="cursor-pointer text-xs flex items-center justify-between"
            >
              <span>Manager</span>
              {currentUser?.role === "Manager" && <span className="text-[10px] text-[#15803D] font-bold">Active</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchUserRole("Cashier")}
              className="cursor-pointer text-xs flex items-center justify-between"
            >
              <span>Cashier</span>
              {currentUser?.role === "Cashier" && <span className="text-[10px] text-[#15803D] font-bold">Active</span>}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push("/change-password");
              }}
              className="cursor-pointer text-xs text-destructive focus:text-destructive flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
