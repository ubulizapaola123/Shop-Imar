"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import {
  Wallet,
  Calendar,
  PlusCircle,
  MinusCircle,
  RotateCw,
  Clock,
  User,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CaissePage() {
  const {
    settings,
    caisseMovements,
    adjustCaisse,
    reconcileCaisse,
    currentUser,
    hasPermission,
  } = useSellPoint();

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Manual Adjustment State
  const [adjustAmount, setAdjustAmount] = useState<number | "">("");
  const [adjustType, setAdjustType] = useState<"deposit" | "withdrawal">("deposit");
  const [adjustReason, setAdjustReason] = useState("");

  // End of Day Count State
  const [countedCash, setCountedCash] = useState<number | "">("");
  const [reconcileNotes, setReconcileNotes] = useState("");
  const [reconciliationResult, setReconciliationResult] = useState<{
    difference: number;
    expected: number;
  } | null>(null);

  // Filter movements by date
  const filteredMovements = caisseMovements.filter((m) =>
    !selectedDate ? true : m.date === selectedDate
  );

  const handleManualAdjust = () => {
    if (typeof adjustAmount !== "number" || adjustAmount <= 0) {
      toast.error("Please enter a valid amount greater than zero");
      return;
    }
    if (!adjustReason.trim()) {
      toast.error("Reason is mandatory for every caisse change");
      return;
    }

    const effectiveAmount = adjustType === "withdrawal" ? -adjustAmount : adjustAmount;

    if (effectiveAmount < 0 && currentUser?.role !== "Admin") {
      toast.error("Negative corrections (withdrawals) are Admin only");
      return;
    }

    const res = adjustCaisse(effectiveAmount, adjustReason.trim());
    if (res.success) {
      toast.success(
        `Caisse updated: ${effectiveAmount > 0 ? "+" : ""}${effectiveAmount.toLocaleString()} Rwf (${adjustReason})`
      );
      setAdjustAmount("");
      setAdjustReason("");
    } else {
      toast.error(res.error || "Adjustment failed");
    }
  };

  const handleEndOfWeekOrDayCount = () => {
    if (typeof countedCash !== "number" || countedCash < 0) {
      toast.error("Please enter the total physical cash counted in Rwf");
      return;
    }

    const res = reconcileCaisse(countedCash, reconcileNotes);
    setReconciliationResult({
      difference: res.difference,
      expected: res.currentBalance,
    });

    if (res.difference === 0) {
      toast.success("Perfect count! Cash counted matches expected caisse balance exactly.");
    } else if (res.difference > 0) {
      toast.info(`Over-count surplus: +${res.difference.toLocaleString()} Rwf recorded.`);
    } else {
      toast.warning(`Shortage deficit: ${res.difference.toLocaleString()} Rwf recorded.`);
    }
  };

  const fmtRwf = (amt: number) => `${amt.toLocaleString()} Rwf`;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#15803D]" />
              Caisse (Cash Register Management)
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitor real-time drawer balance, record manual corrections with audit logging, and perform end-of-day cash counts
            </p>
          </div>

          {/* Date Picker with "Today" option */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(todayStr)}
              className={cn(
                "h-9 text-xs font-semibold",
                selectedDate === todayStr ? "bg-[#DCFCE7] text-[#166534] border-emerald-300" : ""
              )}
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
                All
              </Button>
            )}
          </div>
        </div>

        {/* Caisse Balance Hero Card */}
        <Card className="p-6 border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-[#DCFCE7]/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse"></span>
              Current Physical Cash in Drawer
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#15803D] tracking-tight">
              {fmtRwf(settings.caisseBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Reflects all completed sales, credit payments, incomes, and expenses in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCountedCash(settings.caisseBalance);
                setReconciliationResult(null);
              }}
              className="gap-2 border-emerald-300 text-[#166534] hover:bg-[#DCFCE7]"
            >
              <Calculator className="w-4 h-4" />
              Start End-of-Day Count
            </Button>
          </div>
        </Card>

        {/* 2-Column: Left Movements Audit Table, Right Actions (Manual Update & End of Day) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Caisse Movements Log (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#15803D]" />
                Cash Flow Log ({selectedDate ? `Date: ${selectedDate}` : "All Records"})
              </h3>
              <span className="text-xs text-muted-foreground">
                {filteredMovements.length} log entries
              </span>
            </div>

            <Card className="border-border overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DCFCE7] text-[#166534] font-bold sticky top-0 z-10 border-b border-emerald-200">
                    <tr>
                      <th className="py-2.5 px-3">Date / Time</th>
                      <th className="py-2.5 px-3">Operator</th>
                      <th className="py-2.5 px-3">Reason / Details</th>
                      <th className="py-2.5 px-3 text-right">In / Out</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMovements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          No cash movements for this date.
                        </td>
                      </tr>
                    ) : (
                      filteredMovements.map((m) => {
                        const isPositive = m.amount > 0;
                        const isZero = m.amount === 0;
                        return (
                          <tr key={m.id} className="hover:bg-[#DCFCE7]/20 transition-colors">
                            <td className="py-2.5 px-3 text-muted-foreground font-mono">
                              {m.date}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-[#1F2937]">
                              {m.operatorName}
                            </td>
                            <td className="py-2.5 px-3 max-w-[200px] truncate" title={m.reason}>
                              {m.reason}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold">
                              <span
                                className={cn(
                                  isZero
                                    ? "text-gray-500"
                                    : isPositive
                                    ? "text-[#15803D]"
                                    : "text-[#DC2626]"
                                )}
                              >
                                {isPositive ? "+" : ""}
                                {m.amount.toLocaleString()} Rwf
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#1F2937]">
                              {m.newBalance.toLocaleString()} Rwf
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

          {/* Right Column: Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Manual Update Box */}
            <Card className="p-5 border-border bg-white space-y-4">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#15803D]" />
                  Manual Caisse Adjustment
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Deposit or withdrawal. Negative corrections are Admin only.
                </p>
              </div>

              {/* Deposit vs Withdrawal toggle */}
              <div className="grid grid-cols-2 gap-2 bg-muted/60 p-1 rounded-lg">
                <button
                  onClick={() => setAdjustType("deposit")}
                  className={cn(
                    "py-1.5 text-xs font-bold rounded-md transition-all",
                    adjustType === "deposit"
                      ? "bg-white text-[#15803D] shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  + Cash Deposit
                </button>
                <button
                  onClick={() => {
                    if (currentUser?.role !== "Admin") {
                      toast.error("Negative caisse corrections (withdrawals) are Admin only");
                      return;
                    }
                    setAdjustType("withdrawal");
                  }}
                  className={cn(
                    "py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1",
                    adjustType === "withdrawal"
                      ? "bg-white text-[#DC2626] shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  {currentUser?.role !== "Admin" && <Lock className="w-3 h-3" />}
                  - Withdrawal
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Amount in Rwf *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(parseInt(e.target.value) || "")}
                    placeholder="e.g. 20000"
                    className="mt-1 h-9 text-xs font-bold text-[#15803D]"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">
                    Mandatory Reason for Adjustment *
                  </Label>
                  <Input
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Added morning float change, bank withdrawal..."
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <Button
                  onClick={handleManualAdjust}
                  className={cn(
                    "w-full h-9 text-xs font-bold gap-2 text-white shadow-sm",
                    adjustType === "deposit"
                      ? "bg-[#15803D] hover:bg-[#166534]"
                      : "bg-[#DC2626] hover:bg-red-700"
                  )}
                >
                  Record {adjustType === "deposit" ? "Deposit" : "Withdrawal"}
                </Button>
              </div>
            </Card>

            {/* 2. End-of-Day Count Box */}
            <Card className="p-5 border-border bg-white space-y-4">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-[#15803D]" />
                  End-of-Day Cash Reconciliation
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Count physical bills and coins at close of shift.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">
                    Counted Cash in Drawer (Rwf) *
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={countedCash}
                    onChange={(e) => setCountedCash(parseInt(e.target.value) || 0)}
                    placeholder="Enter total physical count"
                    className="mt-1 h-9 text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Notes (Optional)</Label>
                  <Input
                    value={reconcileNotes}
                    onChange={(e) => setReconcileNotes(e.target.value)}
                    placeholder="Shift notes, coin breakdown..."
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <Button
                  onClick={handleEndOfWeekOrDayCount}
                  className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold h-9 text-xs gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Compare &amp; Reconcile
                </Button>
              </div>

              {/* Difference Result Card */}
              {reconciliationResult && (
                <div
                  className={cn(
                    "p-3 rounded-xl border text-xs space-y-1.5",
                    reconciliationResult.difference === 0
                      ? "bg-[#DCFCE7] border-emerald-300 text-[#166534]"
                      : reconciliationResult.difference > 0
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-red-50 border-red-200 text-red-900"
                  )}
                >
                  <div className="flex justify-between font-semibold">
                    <span>Expected Balance:</span>
                    <span>{fmtRwf(reconciliationResult.expected)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Physical Counted:</span>
                    <span>{fmtRwf(typeof countedCash === "number" ? countedCash : 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-current/20">
                    <span>Difference:</span>
                    <span>
                      {reconciliationResult.difference > 0 ? "+" : ""}
                      {fmtRwf(reconciliationResult.difference)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
