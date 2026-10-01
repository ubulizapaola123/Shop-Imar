"use client";

import React from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import {
  User,
  Shield,
  KeyRound,
  Bell,
  Lock,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Edit3,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { currentUser, sales, settings } = useSellPoint();

  if (!currentUser) {
    return (
      <AdminLayout>
        <div className="p-16 text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Button asChild className="mt-4 bg-[#15803D] text-white">
            <Link href="/change-password">Go to Login</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const roleColors: Record<string, string> = {
    Admin: "bg-red-100 text-red-700 border-red-200",
    Manager: "bg-blue-100 text-blue-700 border-blue-200",
    Cashier: "bg-[#DCFCE7] text-[#166534] border-emerald-200",
  };

  const rolePermissions: Record<string, string[]> = {
    Admin: [
      "Full system access",
      "Manage users & roles",
      "View all reports",
      "Backup & restore data",
      "Configure settings",
      "Cancel sales & restocks",
    ],
    Manager: [
      "Manage stock & products",
      "Process restocks",
      "View profit reports",
      "Manage income & expenses",
      "Cancel sales",
    ],
    Cashier: [
      "Process sales at POS",
      "View sell history",
      "Record credit payments",
      "View caisse balance",
      "Log income & expenses",
    ],
  };

  const mySales = sales.filter(
    (s) => s.operatorName === currentUser.names && s.status === "completed"
  );
  const myTotalSales = mySales.reduce((a, s) => a + s.total, 0);

  const todayStr = new Date().toISOString().split("T")[0];
  const mySalesToday = mySales.filter((s) => s.date === todayStr);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-[#166534]">Home</Link>
          <ArrowRight className="w-3 h-3" />
          <span className="font-semibold text-[#1F2937]">My Profile</span>
        </div>

        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#1F2937]">My Profile</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review your account details, portal role and current workspace access.
          </p>
        </div>

        {/* Identity Banner */}
        <Card className="p-6 border-border shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <Avatar className="w-16 h-16 border-2 border-emerald-300">
              <AvatarFallback className="bg-[#15803D] text-white font-extrabold text-xl">
                {getInitials(currentUser.names)}
              </AvatarFallback>
            </Avatar>

            {/* Name & meta */}
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-[#1F2937]">{currentUser.names}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide", roleColors[currentUser.role] ?? "bg-gray-100 text-gray-700")}>
                  {currentUser.role}
                </span>
                <span className="text-xs text-muted-foreground">@{currentUser.username}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className={cn("text-xs font-semibold", currentUser.active ? "text-[#15803D]" : "text-[#DC2626]")}>
                  {currentUser.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-6 text-center">
              <div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
                  <Calendar className="w-3 h-3" /> Joined
                </div>
                <p className="text-sm font-bold text-[#1F2937]">
                  {new Date(currentUser.createdAt).toLocaleDateString("en-RW", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
                  <Clock className="w-3 h-3" /> Last login
                </div>
                <p className="text-sm font-bold text-[#1F2937]">Today</p>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="border-emerald-300 text-[#166534] hover:bg-[#DCFCE7] gap-2 shrink-0">
              <Link href="/change-password">
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </Link>
            </Button>
          </div>
        </Card>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Account Information */}
          <Card className="p-5 border-border shadow-sm">
            <h4 className="text-sm font-extrabold text-[#1F2937] mb-1">Account Information</h4>
            <p className="text-xs text-muted-foreground mb-4">Your portal identity and access summary.</p>

            <div className="space-y-3">
              {[
                {
                  icon: <ShieldCheck className="w-4 h-4 text-[#15803D]" />,
                  label: "Portal",
                  desc: "The workspace you are signed in to",
                  value: settings.shopName || "Sell Point POS",
                },
                {
                  icon: <Shield className="w-4 h-4 text-blue-500" />,
                  label: "Workspace Access",
                  desc: "Current role-based access level",
                  value: `${currentUser.role} access`,
                },
                {
                  icon: <User className="w-4 h-4 text-emerald-600" />,
                  label: "Account Status",
                  desc: "Your account is ready to use",
                  value: currentUser.active ? "Active" : "Inactive",
                  valueClass: currentUser.active ? "text-[#15803D]" : "text-[#DC2626]",
                },
                {
                  icon: <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />,
                  label: "Effective Permissions",
                  desc: "Permissions applied to this account",
                  value: `${(rolePermissions[currentUser.role] ?? []).length} permissions`,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-border">
                  <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                    {row.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1F2937]">{row.label}</p>
                    <p className="text-[11px] text-muted-foreground">{row.desc}</p>
                  </div>
                  <span className={cn("text-xs font-bold shrink-0", row.valueClass ?? "text-[#1F2937]")}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Manage Access */}
            <div className="mt-4 pt-4 border-t border-border">
              <Button asChild variant="outline" size="sm" className="gap-2 border-emerald-300 text-[#166534] hover:bg-[#DCFCE7] w-full">
                <Link href="/users">
                  <ShieldCheck className="w-3.5 h-3.5" /> Manage Access
                </Link>
              </Button>
            </div>
          </Card>

          {/* Account Settings + Stats */}
          <div className="space-y-4">
            {/* Account Settings */}
            <Card className="p-5 border-border shadow-sm">
              <h4 className="text-sm font-extrabold text-[#1F2937] mb-1">Account Settings</h4>
              <p className="text-xs text-muted-foreground mb-4">Manage your account preferences and security.</p>

              <div className="space-y-2">
                {[
                  {
                    icon: <KeyRound className="w-4 h-4 text-[#15803D]" />,
                    label: "Change Password",
                    desc: "Update your account password",
                    href: "/change-password",
                  },
                  {
                    icon: <Bell className="w-4 h-4 text-blue-500" />,
                    label: "Notification Preferences",
                    desc: "Manage how you receive notifications",
                    href: "/settings",
                  },
                  {
                    icon: <Lock className="w-4 h-4 text-amber-500" />,
                    label: "Security & Sessions",
                    desc: "View active sessions and devices",
                    href: "/settings",
                  },
                  {
                    icon: <Settings2Icon className="w-4 h-4 text-gray-500" />,
                    label: "Shop Settings",
                    desc: "Configure shop preferences",
                    href: "/settings",
                  },
                ].map((row) => (
                  <Link
                    key={row.label}
                    href={row.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#DCFCE7]/40 border border-transparent hover:border-emerald-200 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-border flex items-center justify-center shrink-0 group-hover:border-emerald-200">
                      {row.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1F2937]">{row.label}</p>
                      <p className="text-[11px] text-muted-foreground">{row.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#15803D] shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            </Card>

            {/* Activity Stats */}
            <Card className="p-5 border-border shadow-sm">
              <h4 className="text-sm font-extrabold text-[#1F2937] mb-3">My Activity</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#DCFCE7]/40 border border-emerald-100 text-center">
                  <p className="text-2xl font-black text-[#166534]">{mySales.length}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Total Sales</p>
                </div>
                <div className="p-3 rounded-lg bg-[#DCFCE7]/40 border border-emerald-100 text-center">
                  <p className="text-2xl font-black text-[#166534]">{mySalesToday.length}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Today's Sales</p>
                </div>
                <div className="col-span-2 p-3 rounded-lg bg-gray-50 border border-border text-center">
                  <p className="text-xl font-black text-[#1F2937]">{myTotalSales.toLocaleString()} Rwf</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Total Revenue Generated</p>
                </div>
              </div>
            </Card>

            {/* Permissions list */}
            <Card className="p-5 border-border shadow-sm">
              <h4 className="text-sm font-extrabold text-[#1F2937] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#15803D]" /> Role Permissions
                <span className={cn("ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border", roleColors[currentUser.role])}>
                  {currentUser.role}
                </span>
              </h4>
              <ul className="space-y-1.5">
                {(rolePermissions[currentUser.role] ?? []).map((perm) => (
                  <li key={perm} className="flex items-center gap-2 text-xs text-[#1F2937]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    {perm}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Local icon alias to avoid import collision
function Settings2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
