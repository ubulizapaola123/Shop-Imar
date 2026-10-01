"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import { Income } from "@/types/sellpoint";
import {
  ArrowDownLeft,
  Search,
  Plus,
  Save,
  Ban,
  RotateCcw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function IncomePage() {
  const { incomes, addIncome, cancelIncome, currentUser } = useSellPoint();

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "cancelled">("all");

  // Form State
  const [amount, setAmount] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [incomeDate, setIncomeDate] = useState(todayStr);

  // Void modal
  const [incomeToVoid, setIncomeToVoid] = useState<Income | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const filteredIncomes = incomes
    .filter((inc) => !selectedDate || inc.date === selectedDate)
    .filter((inc) =>
      !searchQuery ||
      inc.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.operatorName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((inc) => statusFilter === "all" || inc.status === statusFilter);

  const activeIncomesTotal = filteredIncomes
    .filter((inc) => inc.status === "active")
    .reduce((acc, inc) => acc + inc.amount, 0);

  const handleNew = () => {
    setAmount("");
    setReason("");
    setIncomeDate(todayStr);
  };

  const handleSave = () => {
    if (typeof amount !== "number" || amount <= 0) {
      toast.error("Valid income amount in Rwf is required");
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason is mandatory");
      return;
    }

    const res = addIncome(amount, reason.trim(), incomeDate);
    if (res.success) {
      toast.success(`Income of ${amount.toLocaleString()} Rwf recorded. Caisse balance increased.`);
      handleNew();
    } else {
      toast.error(res.error || "Failed to record income");
    }
  };

  const handleConfirmCancelIncome = () => {
    if (!incomeToVoid) return;
    if (!voidReason.trim()) {
      toast.error("Cancellation reason is mandatory");
      return;
    }

    const res = cancelIncome(incomeToVoid.id, voidReason.trim());
    if (res.success) {
      toast.success("Income record voided and deducted from Caisse cash.");
      setIncomeToVoid(null);
      setVoidReason("");
    } else {
      toast.error(res.error || "Failed to void income");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-[#15803D]" />
              Other Income Management
            </h2>
            <p className="text-xs text-muted-foreground">
              Record non-sales revenue (bottle crate refunds, interest, scrap disposal) directly into Caisse
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(todayStr)}
              className={cn("h-9 text-xs", selectedDate === todayStr ? "bg-[#DCFCE7] text-[#166534]" : "")}
            >
              Today
            </Button>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 text-xs w-36 bg-white"
            />
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate("")}
                className="h-9 text-xs text-muted-foreground"
              >
                All Dates
              </Button>
            )}
          </div>
        </div>

        {/* 2-Column: Left Incomes List, Right Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Incomes Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="flex flex-wrap items-center gap-2 border-border bg-white p-3.5">
              <div className="relative min-w-[180px] flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reason or operator..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                aria-label="Filter income records by status"
                className="h-8 rounded-md border border-border bg-white px-2.5 text-xs text-muted-foreground"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="cancelled">Voided</option>
              </select>
            </Card>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F2937]">
                Total Active Incomes ({selectedDate || "All"}):{" "}
                <strong className="text-[#15803D]">{activeIncomesTotal.toLocaleString()} Rwf</strong>
              </span>
              <span className="text-xs text-muted-foreground">
                {filteredIncomes.length} records
              </span>
            </div>

            <Card className="border-border overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto max-h-[440px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DCFCE7] text-[#166534] font-bold sticky top-0 z-10 border-b border-emerald-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Operator</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3 text-right">Amount (Rwf)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredIncomes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          No incomes recorded for this date.
                        </td>
                      </tr>
                    ) : (
                      filteredIncomes.map((inc) => {
                        const isCancelled = inc.status === "cancelled";
                        return (
                          <tr
                            key={inc.id}
                            className={cn(
                              "transition-colors",
                              isCancelled ? "bg-red-50/50 opacity-60" : "hover:bg-[#DCFCE7]/20"
                            )}
                          >
                            <td className="py-2.5 px-3 font-mono text-muted-foreground">{inc.date}</td>
                            <td className="py-2.5 px-3 font-medium text-[#1F2937]">{inc.operatorName}</td>
                            <td className="py-2.5 px-3">{inc.reason}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#15803D]">
                              +{inc.amount.toLocaleString()} Rwf
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isCancelled ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-[#DC2626]">
                                  VOIDED
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">
                                  ACTIVE
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {!isCancelled && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setIncomeToVoid(inc);
                                    setVoidReason("");
                                  }}
                                  className="h-7 text-xs text-[#DC2626] hover:bg-red-50 gap-1"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  Cancel Income
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right: Income Entry Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 border-border bg-white space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-bold text-[#1F2937]">Record New Income</h3>
                <p className="text-xs text-muted-foreground">
                  Logged immediately under your operator account and added to cash in Caisse.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Operator (Auto)</Label>
                  <Input
                    disabled
                    value={currentUser?.names || "Operator"}
                    className="mt-1 h-9 text-xs bg-gray-100 font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#15803D]">Amount in Rwf *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || "")}
                    placeholder="e.g. 15000"
                    className="mt-1 h-9 text-xs font-bold text-[#15803D]"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Reason for Income *</Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Deposit return on Bralirwa crates, carton boxes sale..."
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Date</Label>
                  <Input
                    type="date"
                    value={incomeDate}
                    onChange={(e) => setIncomeDate(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Required buttons: New, Save, Cancel Income */}
              <div className="pt-3 border-t border-border grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNew}
                  className="gap-1 border-border text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New
                </Button>

                <Button
                  size="sm"
                  disabled={typeof amount !== "number" || amount <= 0 || !reason.trim()}
                  onClick={handleSave}
                  className="gap-1 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Income
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Void Income Modal */}
        {incomeToVoid && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Cancel / Void Income?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Amount: {incomeToVoid.amount.toLocaleString()} Rwf • &ldquo;{incomeToVoid.reason}&rdquo;
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                The record stays flagged as voided and will be deducted from cash in Caisse and excluded from profit totals.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]">
                  Cancellation Reason <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Mistyped amount, transaction cancelled..."
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setIncomeToVoid(null)} className="flex-1">
                  Keep Income
                </Button>
                <Button
                  disabled={!voidReason.trim()}
                  onClick={handleConfirmCancelIncome}
                  className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white font-bold"
                >
                  Confirm Void
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AdminLayout>
  );
}
