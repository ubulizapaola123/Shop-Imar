"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import {
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { currentUser, changePassword, login, logout, users } = useSellPoint();

  // Mode: if user is logged in, show Change Password; if logged out, show Login screen
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Login form state (if logged out)
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 3) {
      toast.error("New password must be at least 3 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    const res = changePassword(currentPassword, newPassword);
    if (res.success) {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || "Password update failed");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      toast.error("Please enter your username");
      return;
    }

    const res = login(loginUsername, loginPassword);
    if (res.success) {
      toast.success(`Welcome back, ${loginUsername}!`);
      router.push("/");
    } else {
      toast.error(res.error || "Login failed");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      toast.info("Logged out successfully");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
        {currentUser ? (
          /* User is logged in: Change Password Form */
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#15803D]" />
                Change Account Password
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update login credentials for operator account:{" "}
                <strong className="text-[#15803D]">{currentUser.names}</strong> (@{currentUser.username})
              </p>
            </div>

            <Card className="p-6 border-border bg-white shadow-sm space-y-5">
              <div className="p-3.5 rounded-xl bg-[#DCFCE7]/60 border border-emerald-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-[#166534]">Active Account Role: {currentUser.role}</span>
                  <p className="text-muted-foreground mt-0.5">
                    Your current password is required before saving a new password.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current password */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1F2937]">Current Password *</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="h-10 text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1F2937]">New Password *</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 3 characters"
                      className="h-10 text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1F2937]">Confirm New Password *</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#15803D] hover:bg-[#166534] text-white font-bold h-10 gap-2 shadow-sm text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Update Password
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    className="gap-2 border-red-200 text-[#DC2626] hover:bg-red-50 h-10 text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        ) : (
          /* User is logged out: Login Screen */
          <div className="space-y-6 max-w-md mx-auto pt-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#15803D] text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1F2937]">Sell Point Login</h2>
              <p className="text-xs text-muted-foreground">
                Enter your staff credentials to access counter POS
              </p>
            </div>

            <Card className="p-6 border-border bg-white shadow-lg space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1F2937]">Username</Label>
                  <Input
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="e.g. admin, manager, cashier"
                    className="h-10 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1F2937]">Password</Label>
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="e.g. 123"
                    className="h-10 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold h-10 text-sm shadow-md"
                >
                  Sign In to Sell Point
                </Button>
              </form>

              {/* Quick Login Helper for Testing */}
              <div className="pt-3 border-t border-border space-y-2">
                <p className="text-[11px] text-muted-foreground font-semibold text-center">
                  Quick Logins (Password is 123 for all):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      login("admin", "123");
                      router.push("/");
                    }}
                    className="text-[11px] h-8 bg-emerald-50 text-[#166534] border-emerald-200 hover:bg-[#DCFCE7]"
                  >
                    Admin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      login("manager", "123");
                      router.push("/");
                    }}
                    className="text-[11px] h-8 bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                  >
                    Manager
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      login("cashier", "123");
                      router.push("/");
                    }}
                    className="text-[11px] h-8 bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                  >
                    Cashier
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
