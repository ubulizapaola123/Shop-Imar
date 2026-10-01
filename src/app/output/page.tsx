"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import { OutputExpense } from "@/types/sellpoint";
import {
  ArrowUpRight,
  Search,
  Plus,
  Save,
  Ban,
  Calendar,
  AlertTriangle,
  Wallet,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OutputPage() {
  const { outputs, addOutput, cancelOutput, currentUser, settings } = useSellPoint();

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [amount, setAmount] = useState<number | "">("");
  const [categoryReason, setCategoryReason] = useState(settings.outputReasons[0] || "Payment");
  const [details, setDetails] = useState("");
  const [outputDate, setOutputDate] = useState(todayStr);

  // Cancel Modal
  const [outputToCancel, setOutputToCancel] = useState<OutputExpense | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const filteredOutputs = outputs.filter((o) => {
    const matchesDate = !selectedDate || o.date === selectedDate;
    const matchesSearch =
      o.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.operatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const activeTotal = filteredOutputs
    .filter((o) => o.status === "active")
    .reduce((acc, o) => acc + o.amount, 0);

  const handleNew = () => {
    setAmount("");
    setCategoryReason(settings.outputReasons[0] || "Payment");
    setDetails("");
    setOutputDate(todayStr);
  };

  const handleSave = () => {
    if (typeof amount !== "number" || amount <= 0) {
      toast.error("Valid expense amount in Rwf is required");
      return;
    }
    if (!categoryReason) {
      toast.error("Reason category is mandatory");
      return;
    }

    // Acceptance rule 5: An Output of 100 Rwf appears in the list and lowers the Caisse by 100
    // Warn if amount > cash in Caisse
    if (amount > settings.caisseBalance) {
      toast.error(
        `Warning: Amount (${amount.toLocaleString()} Rwf) exceeds current Cash in Caisse (${settings.caisseBalance.toLocaleString()} Rwf)! Operation blocked.`
      );
      return;
    }

    const res = addOutput(amount, categoryReason, details.trim(), outputDate);
    if (res.success) {
      toast.success(
        `Expense of ${amount.toLocaleString()} Rwf recorded. Cash in Caisse reduced accordingly.`
      );
      handleNew();
    } else {
      toast.error(res.error || "Failed to record expense");
    }
  };

  const handleConfirmCancelOutput = () => {
    if (!outputToCancel) return;
    if (!cancelReason.trim()) {
      toast.error("Cancellation reason is mandatory");
      return;
    }

    const res = cancelOutput(outputToCancel.id, cancelReason.trim());
    if (res.success) {
      toast.success("Expense cancelled and cash restored to Caisse.");
      setOutputToCancel(null);
      setCancelReason("");
    } else {
      toast.error(res.error || "Failed to cancel expense");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#DC2626]" />
              Output (Expenses &amp; Payouts)
            </h2>
            <p className="text-xs text-muted-foreground">
              Record counter cash expenses, rent, transport, salaries, and supplier payouts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] font-bold border border-emerald-200">
              Drawer Cash: {settings.caisseBalance.toLocaleString()} Rwf
            </span>
          </div>
        </div>

        {/* 2-Column: Left Expenses List, Right Expense Entry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filter & List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-3.5 border-border bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Date:</span>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-8 text-xs w-36"
                />
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate("")}
                    className="h-8 text-xs"
                  >
                    All
                  </Button>
                )}
              </div>

              <div className="relative w-full sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </Card>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-[#1F2937]">
                Total Output:{" "}
                <strong className="text-[#DC2626]">{activeTotal.toLocaleString()} Rwf</strong>
              </span>
              <span className="text-muted-foreground">{filteredOutputs.length} records</span>
            </div>

            <Card className="border-border overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto max-h-[440px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DCFCE7] text-[#166534] font-bold sticky top-0 z-10 border-b border-emerald-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Operator</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Details</th>
                      <th className="py-2.5 px-3 text-right">Amount (Rwf)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOutputs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          No expenses recorded.
                        </td>
                      </tr>
                    ) : (
                      filteredOutputs.map((o) => {
                        const isCancelled = o.status === "cancelled";
                        return (
                          <tr
                            key={o.id}
                            className={cn(
                              "transition-colors",
                              isCancelled ? "bg-red-50/50 opacity-60" : "hover:bg-red-50/20"
                            )}
                          >
                            <td className="py-2.5 px-3 font-mono text-muted-foreground">{o.date}</td>
                            <td className="py-2.5 px-3 font-medium text-[#1F2937]">{o.operatorName}</td>
                            <td className="py-2.5 px-3 font-semibold text-[#1F2937]">{o.reason}</td>
                            <td className="py-2.5 px-3 text-muted-foreground max-w-[140px] truncate" title={o.details}>
                              {o.details || "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#DC2626]">
                              -{o.amount.toLocaleString()} Rwf
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isCancelled ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-[#DC2626]">
                                  VOIDED
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                                  PAID
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {!isCancelled && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setOutputToCancel(o);
                                    setCancelReason("");
                                  }}
                                  className="h-7 text-xs text-[#DC2626] hover:bg-red-50 gap-1"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  Cancel Output
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

          {/* Right Column: Expense Entry Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 border-border bg-white space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-bold text-[#1F2937]">Record Expense / Payout</h3>
                <p className="text-xs text-muted-foreground">
                  Cash is deducted from Caisse automatically. Reason and details are recorded.
                </p>
              </div>

              {/* Caisse warning alert if amount > caisse */}
              {typeof amount === "number" && amount > settings.caisseBalance && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Warning: Amount ({amount.toLocaleString()} Rwf) is greater than cash in Caisse (
                    {settings.caisseBalance.toLocaleString()} Rwf)!
                  </span>
                </div>
              )}

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
                  <Label className="text-xs font-semibold text-[#DC2626]">Amount in Rwf *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || "")}
                    placeholder="e.g. 5000"
                    className="mt-1 h-9 text-xs font-bold text-[#DC2626]"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Reason Category *</Label>
                  <select
                    value={categoryReason}
                    onChange={(e) => setCategoryReason(e.target.value)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#15803D]"
                  >
                    {settings.outputReasons.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Details &amp; Notes</Label>
                  <Input
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="e.g. Moto taxi delivery of rice bags, water bill..."
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Date</Label>
                  <Input
                    type="date"
                    value={outputDate}
                    onChange={(e) => setOutputDate(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Required buttons: New, Save, Cancel Output */}
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
                  disabled={
                    typeof amount !== "number" ||
                    amount <= 0 ||
                    amount > settings.caisseBalance
                  }
                  onClick={handleSave}
                  className="gap-1 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Output
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Cancel Output Modal */}
        {outputToCancel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Cancel / Void Output?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Amount: {outputToCancel.amount.toLocaleString()} Rwf • [{outputToCancel.reason}]
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-[#166534]">
                This will restore {outputToCancel.amount.toLocaleString()} Rwf cash back into Caisse. The record remains flagged as voided in the audit log.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]">
                  Cancellation Reason <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Expense was refunded or recorded mistakenly..."
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setOutputToCancel(null)} className="flex-1">
                  Keep Expense
                </Button>
                <Button
                  disabled={!cancelReason.trim()}
                  onClick={handleConfirmCancelOutput}
                  className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white font-bold"
                >
                  Confirm Void
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
