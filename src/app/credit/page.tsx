"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import { Sale } from "@/types/sellpoint";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  RotateCcw,
  ArrowRight,
  UserCheck,
  History,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CreditPage() {
  const { sales, creditPayments, makeCreditPayment, settings } = useSellPoint();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [isFullPaid, setIsFullPaid] = useState(false);
  const [paymentNote, setPaymentNote] = useState("");

  // Collect all sales with credit
  const creditSales = sales.filter((s) => s.creditAmount > 0 && s.status === "completed");

  // Calculate remaining balances
  const debtors = creditSales.map((s) => {
    const paidSoFar = creditPayments
      .filter((cp) => cp.saleId === s.id)
      .reduce((acc, cp) => acc + cp.amount, 0);
    const balanceOwed = Math.max(0, s.creditAmount - paidSoFar);

    return {
      sale: s,
      paidSoFar,
      balanceOwed,
      isFullySettled: balanceOwed === 0,
    };
  });

  // Filter debtors by search
  const filteredDebtors = debtors.filter((d) =>
    d.sale.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstandingCredit = debtors.reduce((acc, d) => acc + d.balanceOwed, 0);

  const selectedDebtor = debtors.find((d) => d.sale.id === selectedSaleId);

  const handleSelectDebt = (d: typeof debtors[0]) => {
    setSelectedSaleId(d.sale.id);
    setIsFullPaid(false);
    setPayAmount(d.balanceOwed);
    setPaymentNote("");
  };

  const handleToggleFullPaid = (checked: boolean) => {
    setIsFullPaid(checked);
    if (selectedDebtor && checked) {
      setPayAmount(selectedDebtor.balanceOwed);
    }
  };

  const handleUpdatePayment = () => {
    if (!selectedDebtor) {
      toast.error("Please select a debtor record from the list");
      return;
    }

    const amt = typeof payAmount === "number" ? payAmount : 0;
    if (amt <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }
    if (amt > selectedDebtor.balanceOwed) {
      toast.error(
        `Payment cannot exceed the outstanding balance (${selectedDebtor.balanceOwed.toLocaleString()} Rwf)`
      );
      return;
    }

    const res = makeCreditPayment({
      saleId: selectedDebtor.sale.id,
      amount: amt,
      note: paymentNote.trim() || undefined,
    });

    if (res.success) {
      toast.success(
        `Received ${amt.toLocaleString()} Rwf payment from ${selectedDebtor.sale.clientName}. Caisse updated!`
      );
      setPayAmount("");
      setIsFullPaid(false);
      setPaymentNote("");
      if (amt === selectedDebtor.balanceOwed) {
        toast.info(`Debt for Ticket ${selectedDebtor.sale.saleNumber} has been fully settled!`);
      }
    } else {
      toast.error(res.error || "Payment recording failed");
    }
  };

  // Export debtors list to CSV
  const handleExportDebtorsCSV = () => {
    const headers = ["Sale_Ticket", "Client_Name", "Date", "Original_Credit", "Paid_So_Far", "Balance_Owed"];
    const rows = debtors.map((d) => [
      d.sale.saleNumber,
      `"${d.sale.clientName.replace(/"/g, '""')}"`,
      d.sale.date,
      d.sale.creditAmount,
      d.paidSoFar,
      d.balanceOwed,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sellpoint_debtors_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Debtors list exported to CSV");
  };

  const handlePrintDebtors = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#15803D]" />
              Credit &amp; Debtors Management
            </h2>
            <p className="text-xs text-muted-foreground">
              Track customer debt, register partial or full repayments, and synchronize directly into Caisse cash
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 font-bold border border-amber-200">
              Total Unpaid Credit: {totalOutstandingCredit.toLocaleString()} Rwf
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintDebtors}
              className="gap-1.5 border-border hover:bg-gray-100"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Debtors
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDebtorsCSV}
              className="gap-1.5 border-emerald-300 text-[#166534] hover:bg-[#DCFCE7]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* 2-Column: Left Debtors List, Right Payment & History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Debtors List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-3.5 border-border bg-white flex items-center justify-between gap-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client name or ticket number..."
                  className="pl-9 h-8 text-xs"
                />
              </div>
            </Card>

            <Card className="border-border overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto max-h-[440px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DCFCE7] text-[#166534] font-bold sticky top-0 z-10 border-b border-emerald-200">
                    <tr>
                      <th className="py-2.5 px-3">Ticket / Client</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Orig. Debt</th>
                      <th className="py-2.5 px-3 text-right">Paid</th>
                      <th className="py-2.5 px-3 text-right">Still Owed</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDebtors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          No credit records match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredDebtors.map((d) => {
                        const isSelected = selectedSaleId === d.sale.id;
                        return (
                          <tr
                            key={d.sale.id}
                            onClick={() => handleSelectDebt(d)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected
                                ? "bg-[#DCFCE7]/70 font-semibold"
                                : d.isFullySettled
                                ? "bg-gray-50/60 opacity-60"
                                : "hover:bg-[#DCFCE7]/20"
                            )}
                          >
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-[#15803D] block">
                                {d.sale.saleNumber}
                              </span>
                              <span className="font-semibold text-[#1F2937]">
                                {d.sale.clientName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground">{d.sale.date}</td>
                            <td className="py-2.5 px-3 text-right text-muted-foreground">
                              {d.sale.creditAmount.toLocaleString()} Rwf
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#15803D]">
                              {d.paidSoFar.toLocaleString()} Rwf
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#DC2626]">
                              {d.balanceOwed.toLocaleString()} Rwf
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {d.isFullySettled ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">
                                  PAID
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                  OWING
                                </span>
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

          {/* Right Column: Repayment Form & History (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedDebtor ? (
              <Card className="p-5 border-border bg-white space-y-4">
                <div className="border-b border-border pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Selected Debt Account
                  </span>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    {selectedDebtor.sale.clientName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sale: <strong>{selectedDebtor.sale.saleNumber}</strong> • Original Credit:{" "}
                    <strong>{selectedDebtor.sale.creditAmount.toLocaleString()} Rwf</strong>
                  </p>
                </div>

                {/* Outstanding balance card */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Current Balance Owed:</span>
                  <span className="text-lg font-black text-[#DC2626]">
                    {selectedDebtor.balanceOwed.toLocaleString()} Rwf
                  </span>
                </div>

                {selectedDebtor.isFullySettled ? (
                  <div className="p-4 rounded-xl bg-[#DCFCE7] text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-[#15803D] mx-auto" />
                    <p className="text-xs font-bold text-[#166534]">
                      This debt is 100% paid and settled!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Full paid checkbox */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="full-paid"
                        checked={isFullPaid}
                        onCheckedChange={(c) => handleToggleFullPaid(!!c)}
                      />
                      <label
                        htmlFor="full-paid"
                        className="text-xs font-bold text-[#1F2937] cursor-pointer select-none"
                      >
                        Tick &ldquo;Full paid&rdquo; ({selectedDebtor.balanceOwed.toLocaleString()} Rwf)
                      </label>
                    </div>

                    {/* Paid amount input */}
                    <div>
                      <Label className="text-xs font-semibold text-[#1F2937]">
                        Payment Amount Received (Rwf) *
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={selectedDebtor.balanceOwed}
                        value={payAmount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || "";
                          setPayAmount(val);
                          if (val === selectedDebtor.balanceOwed) setIsFullPaid(true);
                          else setIsFullPaid(false);
                        }}
                        placeholder="e.g. 5000"
                        className="mt-1 h-9 text-xs font-bold text-[#15803D]"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-[#1F2937]">
                        Payment Note / Receipt Ref (Optional)
                      </Label>
                      <Input
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder="e.g. Cash paid at counter, MTN MoMo ref..."
                        className="mt-1 h-9 text-xs"
                      />
                    </div>

                    <Button
                      onClick={handleUpdatePayment}
                      disabled={typeof payAmount !== "number" || payAmount <= 0}
                      className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold h-10 gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Update Debt Payment
                    </Button>
                  </div>
                )}

                {/* Payment History For This Sale */}
                <div className="pt-3 border-t border-border space-y-2">
                  <h4 className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#15803D]" />
                    Payment Repayment History
                  </h4>
                  <div className="divide-y divide-border max-h-36 overflow-y-auto">
                    {creditPayments.filter((cp) => cp.saleId === selectedDebtor.sale.id).length ===
                    0 ? (
                      <p className="text-[11px] text-muted-foreground py-2">
                        No payments recorded yet for this debt.
                      </p>
                    ) : (
                      creditPayments
                        .filter((cp) => cp.saleId === selectedDebtor.sale.id)
                        .map((cp) => (
                          <div key={cp.id} className="py-1.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-[#15803D]">
                                +{cp.amount.toLocaleString()} Rwf
                              </span>
                              <span className="text-[10px] text-muted-foreground block">
                                {cp.paymentDate} • By {cp.operatorName}
                              </span>
                            </div>
                            {cp.note && (
                              <span className="text-[10px] text-gray-500 italic max-w-[120px] truncate">
                                {cp.note}
                              </span>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 border-border bg-white text-center text-xs text-muted-foreground space-y-2">
                <CreditCard className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="font-medium text-sm text-[#1F2937]">Select a Debtor</p>
                <p>Click on any client or ticket on the left to enter repayments.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
