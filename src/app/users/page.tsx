"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import { User, UserRole } from "@/types/sellpoint";
import {
  Users as UsersIcon,
  Plus,
  Save,
  Trash2,
  X,
  Lock,
  ShieldCheck,
  UserCheck,
  UserX,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UsersPage() {
  const router = useRouter();
  const { users, addUser, updateUser, deleteUser, currentUser, hasPermission } = useSellPoint();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Form State
  const [names, setNames] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Cashier");
  const [isActive, setIsActive] = useState<boolean>(true);

  if (!hasPermission("Admin")) {
    return (
      <AdminLayout>
        <div className="p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1F2937]">Access Restricted</h3>
          <p className="text-xs text-muted-foreground">
            Only System Administrators have permission to view or manage User Accounts.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const handleSelectUser = (u: User) => {
    setSelectedUserId(u.id);
    setNames(u.names);
    setUsername(u.username);
    setPassword(u.password);
    setRole(u.role);
    setIsActive(u.active);
  };

  const handleNew = () => {
    setSelectedUserId(null);
    setNames("");
    setUsername("");
    setPassword("");
    setRole("Cashier");
    setIsActive(true);
  };

  const handleClose = () => {
    handleNew();
  };

  const handleSaveOrUpdate = () => {
    if (!names.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!password.trim() || password.length < 3) {
      toast.error("Password must be at least 3 characters");
      return;
    }

    if (selectedUserId) {
      const res = updateUser(selectedUserId, {
        names: names.trim(),
        username: username.trim(),
        password: password.trim(),
        role,
        active: isActive,
      });
      if (res.success) {
        toast.success(`User @${username} updated successfully`);
      } else {
        toast.error(res.error || "Update failed");
      }
    } else {
      const res = addUser({
        names: names.trim(),
        username: username.trim(),
        password: password.trim(),
        role,
        active: isActive,
      });
      if (res.success) {
        toast.success(`User @${username} created successfully`);
        handleNew();
      } else {
        toast.error(res.error || "Failed to create user");
      }
    }
  };

  const handleDelete = () => {
    if (!selectedUserId) return;
    if (!window.confirm("Are you sure you want to delete / deactivate this user?")) {
      return;
    }

    const res = deleteUser(selectedUserId);
    if (res.success) {
      toast.success("User processed (deactivated if existing transactions were found)");
      handleNew();
    } else {
      toast.error(res.error || "Failed to delete user");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-[#15803D]" />
              System Users &amp; Permissions
            </h2>
            <p className="text-xs text-muted-foreground">
              Define staff roles (Admin, Manager, Cashier) and manage active POS counter credentials
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] font-bold border border-emerald-200">
            Admin Controlled
          </span>
        </div>

        {/* 2-Column: Left User List, Right User Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Users List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-border overflow-hidden bg-white shadow-sm">
              <div className="p-4 border-b border-border bg-[#DCFCE7]/20 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1F2937]">Registered System Staff</h3>
                <span className="text-xs text-muted-foreground">{users.length} users</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DCFCE7] text-[#166534] font-bold border-b border-emerald-200">
                    <tr>
                      <th className="py-2.5 px-3">Names</th>
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">Role Type</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u) => {
                      const isSelected = selectedUserId === u.id;
                      return (
                        <tr
                          key={u.id}
                          onClick={() => handleSelectUser(u)}
                          className={cn(
                            "cursor-pointer transition-colors",
                            isSelected
                              ? "bg-[#DCFCE7]/70 font-semibold"
                              : !u.active
                              ? "bg-gray-100/70 opacity-60"
                              : "hover:bg-[#DCFCE7]/20"
                          )}
                        >
                          <td className="py-2.5 px-3 font-semibold text-[#1F2937]">{u.names}</td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">@{u.username}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold",
                                u.role === "Admin"
                                  ? "bg-emerald-100 text-[#166534]"
                                  : u.role === "Manager"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              )}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {u.active ? (
                              <span className="text-[10px] font-bold text-[#15803D] flex items-center justify-center gap-1">
                                <UserCheck className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#DC2626] flex items-center justify-center gap-1">
                                <UserX className="w-3 h-3" /> Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground font-mono">
                            {u.createdAt}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column: User CRUD Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 border-border bg-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-[#1F2937]">
                  {selectedUserId ? "Modify User Account" : "Add New User Account"}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                  {selectedUserId || "NEW"}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Full Names *</Label>
                  <Input
                    value={names}
                    onChange={(e) => setNames(e.target.value)}
                    placeholder="e.g. Mugisha Jean de Dieu"
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Username (Login ID) *</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. jmugisha"
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Password *</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">User Type (Role)</Label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:ring-1 focus-visible:ring-[#15803D]"
                    >
                      <option value="Cashier">Cashier</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">Status</Label>
                    <select
                      value={isActive ? "Active" : "Inactive"}
                      onChange={(e) => setIsActive(e.target.value === "Active")}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:ring-1 focus-visible:ring-[#15803D]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4 Required Buttons: New, Save, Delete (deactivate if history), Close */}
              <div className="pt-3 border-t border-border grid grid-cols-2 gap-2">
                {/* 1. New */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNew}
                  className="gap-1 border-border text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New
                </Button>

                {/* 2. Save */}
                <Button
                  size="sm"
                  onClick={handleSaveOrUpdate}
                  className="gap-1 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {selectedUserId ? "Update" : "Save"}
                </Button>

                {/* 3. Delete */}
                {selectedUserId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="gap-1 border-red-300 text-[#DC2626] hover:bg-red-50 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete / Deactivate
                  </Button>
                )}

                {/* 4. Close */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="gap-1 text-muted-foreground text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  Close
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
