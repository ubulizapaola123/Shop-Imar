"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import { Sale } from "@/types/sellpoint";
import {
  Receipt,
  Search,
  Calendar,
  Eye,
  Printer,
  Ban,
  FileDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  ShoppingCart,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SellListPage() {
  const { sales, cancelSale, currentUser, settings, products, processSale } = useSellPoint();

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "cancelled">("all");

  // Inspection modal
  const [inspectedSale, setInspectedSale] = useState<Sale | null>(null);

  // Cancel sale modal
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [newSaleStep, setNewSaleStep] = useState(1);
  const [newSaleSearch, setNewSaleSearch] = useState("");
  const [newSaleQuantities, setNewSaleQuantities] = useState<Record<string, number>>({});
  const [newSaleClient, setNewSaleClient] = useState("Unknown Client");
  const [newSaleCredit, setNewSaleCredit] = useState(false);

  // Filter sales
  const filteredSales = sales.filter((s) => {
    const matchesDate = !selectedDate || s.date === selectedDate;
    const matchesSearch =
      s.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.operatorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesDate && matchesSearch && matchesStatus;
  });

  const totalFilteredSum = filteredSales
    .filter((s) => s.status === "completed")
    .reduce((acc, s) => acc + s.total, 0);

  const totalCreditSum = filteredSales
    .filter((s) => s.status === "completed")
    .reduce((acc, s) => acc + s.creditAmount, 0);

  const saleProducts = products
    .filter((product) => !product.archived && product.quantity > 0)
    .filter((product) =>
      `${product.name} ${product.category}`.toLowerCase().includes(newSaleSearch.toLowerCase())
    );
  const selectedNewSaleProducts = products.filter((product) => (newSaleQuantities[product.id] || 0) > 0);
  const newSaleItemCount = selectedNewSaleProducts.reduce((total, product) => total + (newSaleQuantities[product.id] || 0), 0);
  const newSaleTotal = selectedNewSaleProducts.reduce(
    (total, product) => total + product.sellPrice * (newSaleQuantities[product.id] || 0),
    0
  );

  const updateNewSaleQuantity = (productId: string, change: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setNewSaleQuantities((current) => {
      const nextQuantity = Math.max(0, Math.min(product.quantity, (current[productId] || 0) + change));
      return { ...current, [productId]: nextQuantity };
    });
  };

  const closeNewSale = () => {
    setIsNewSaleOpen(false);
    setNewSaleStep(1);
    setNewSaleSearch("");
    setNewSaleQuantities({});
    setNewSaleClient("Unknown Client");
    setNewSaleCredit(false);
  };

  const completeNewSale = () => {
    if (selectedNewSaleProducts.length === 0) {
      toast.error("Select at least one product");
      setNewSaleStep(1);
      return;
    }
    if (newSaleCredit && newSaleClient === "Unknown Client") {
      toast.error("Credit sales require a named client");
      setNewSaleStep(2);
      return;
    }

    const result = processSale({
      clientName: newSaleClient.trim() || "Unknown Client",
      date: todayStr,
      creditAmount: newSaleCredit ? newSaleTotal : 0,
      items: selectedNewSaleProducts.map((product) => ({
        productId: product.id,
        name: product.name,
        stock: product.quantity,
        sellPrice: product.sellPrice,
        costPrice: product.buyPrice,
        quantity: newSaleQuantities[product.id],
        customPriceAllowed: false,
      })),
    });

    if (result.success) {
      toast.success("Sale completed successfully");
      closeNewSale();
    } else {
      toast.error(result.error || "Unable to complete sale");
    }
  };

  const renderPageOverlay = (children: React.ReactNode) =>
    typeof document === "undefined" ? null : createPortal(children, document.body);

  const handleConfirmCancel = () => {
    if (!saleToCancel) return;
    if (!cancelReason.trim()) {
      toast.error("Cancellation reason is mandatory");
      return;
    }

    const res = cancelSale(saleToCancel.id, cancelReason.trim());
    if (res.success) {
      toast.success(`Sale ${saleToCancel.saleNumber} cancelled successfully. Stock & cash reversed.`);
      setSaleToCancel(null);
      setCancelReason("");
      if (inspectedSale?.id === saleToCancel.id) {
        setInspectedSale(null);
      }
    } else {
      toast.error(res.error || "Failed to cancel sale");
    }
  };

  const handlePrint = (sale: Sale) => {
    setInspectedSale(sale);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#15803D]" />
              Sales History & Receipts
            </h2>
            <p className="text-xs text-muted-foreground">
              Filter sales by date, view line items, reprint receipts, or perform authorized sale cancellations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] font-bold border border-emerald-200">
              Completed Sales: {totalFilteredSum.toLocaleString()} Rwf
            </span>
            <Button
              size="sm"
              onClick={() => setIsNewSaleOpen(true)}
              className="gap-1.5 bg-[#15803D] text-white hover:bg-[#166534]"
            >
              <Plus className="h-3.5 w-3.5" /> New Sale
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <Card className="p-4 border-border bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Choose Date */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Date:</span>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-xs w-36 bg-gray-50"
              />
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate("")}
                  className="h-8 text-xs text-muted-foreground hover:text-black"
                >
                  All Dates
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
              <button
                onClick={() => setFilterStatus("all")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-semibold transition-colors",
                  filterStatus === "all" ? "bg-white text-[#166534] shadow-sm" : "text-muted-foreground hover:text-black"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("completed")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-semibold transition-colors",
                  filterStatus === "completed" ? "bg-white text-[#15803D] shadow-sm" : "text-muted-foreground hover:text-black"
                )}
              >
                Active Only
              </button>
              <button
                onClick={() => setFilterStatus("cancelled")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-semibold transition-colors",
                  filterStatus === "cancelled" ? "bg-white text-[#DC2626] shadow-sm" : "text-muted-foreground hover:text-black"
                )}
              >
                Cancelled Only
              </button>
            </div>
          </div>

          {/* Search Query */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, client, operator..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </Card>

        {/* Sales Table */}
        <Card className="border-border overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#DCFCE7] text-[#166534] font-bold border-b border-emerald-200">
                <tr>
                  <th className="py-3 px-4">Sale ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4 text-right">Paid (Cash)</th>
                  <th className="py-3 px-4 text-right">Credit Debt</th>
                  <th className="py-3 px-4 text-right">Total (Rwf)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground text-sm">
                      No sales records found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((s) => {
                    const isCancelled = s.status === "cancelled";
                    const canCancel =
                      !isCancelled &&
                      (currentUser?.role === "Admin" || currentUser?.id === s.operatorId);

                    return (
                      <tr
                        key={s.id}
                        className={cn(
                          "transition-colors",
                          isCancelled ? "bg-red-50/50 opacity-75" : "hover:bg-[#DCFCE7]/30"
                        )}
                      >
                        <td
                          onClick={() => setInspectedSale(s)}
                          className="py-3 px-4 font-mono font-bold text-[#15803D] cursor-pointer hover:underline"
                        >
                          {s.saleNumber}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{s.date}</td>
                        <td className="py-3 px-4 font-medium text-[#1F2937]">{s.clientName}</td>
                        <td className="py-3 px-4 text-muted-foreground">{s.operatorName}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {s.paidAmount.toLocaleString()} Rwf
                        </td>
                        <td className="py-3 px-4 text-right">
                          {s.creditAmount > 0 ? (
                            <span className="font-semibold text-amber-700">
                              {s.creditAmount.toLocaleString()} Rwf
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0 Rwf</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#1F2937]">
                          {s.total.toLocaleString()} Rwf
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isCancelled ? (
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#DC2626] border border-red-200"
                              title={`Cancelled by ${s.cancelledBy}: ${s.cancelReason}`}
                            >
                              CANCELLED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#166534]">
                              COMPLETED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Line items */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectedSale(s)}
                              className="h-7 px-2 text-xs gap-1 hover:bg-[#DCFCE7] text-[#166534]"
                              title="View lines"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Button>

                            {/* Print Bill */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrint(s)}
                              className="h-7 px-2 text-xs gap-1 border-border hover:bg-gray-100"
                              title="Print thermal bill"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Print
                            </Button>

                            {/* Cancel Sale */}
                            {!isCancelled && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!canCancel}
                                onClick={() => {
                                  setSaleToCancel(s);
                                  setCancelReason("");
                                }}
                                className={cn(
                                  "h-7 px-2 text-xs gap-1 text-[#DC2626] hover:bg-red-50",
                                  !canCancel && "opacity-40 cursor-not-allowed"
                                )}
                                title={
                                  canCancel
                                    ? "Cancel this sale and reverse stock"
                                    : "Only seller or Admin can cancel"
                                }
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {isNewSaleOpen && renderPageOverlay(
          <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="New sale">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1F2937]">
                  <ShoppingCart className="h-4 w-4 text-[#15803D]" /> New Sale
                </div>
                <button type="button" onClick={closeNewSale} className="rounded p-1 text-muted-foreground hover:bg-gray-100 hover:text-[#1F2937]" aria-label="Close new sale">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 border-b border-border px-5 py-3 text-[10px] font-semibold">
                {[[1, "Select Products"], [2, "Payment"], [3, "Review"]].map(([number, label], index) => (
                  <React.Fragment key={String(number)}>
                    {index > 0 && <span className="h-px flex-1 bg-border" />}
                    <div className={cn("flex items-center gap-1.5", newSaleStep === number ? "text-[#15803D]" : "text-muted-foreground")}>
                      <span className={cn("grid h-5 w-5 place-items-center rounded-full border", newSaleStep === number ? "border-[#15803D] bg-[#15803D] text-white" : "border-border bg-white")}>{number}</span>
                      <span>{label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="p-4">
                {newSaleStep === 1 && <>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={newSaleSearch} onChange={(event) => setNewSaleSearch(event.target.value)} placeholder="Search product by name or scan barcode..." className="h-9 pl-9 text-xs" autoFocus />
                  </div>
                  <div className="max-h-[255px] overflow-y-auto rounded-lg border border-border">
                    <div className="grid grid-cols-[1fr_70px_54px_96px] border-b border-border bg-[#F0FDF4] px-3 py-2 text-[10px] font-bold text-[#166534]">
                      <span>Product</span><span>Price</span><span>Stock</span><span className="text-center">Qty</span>
                    </div>
                    {saleProducts.slice(0, 12).map((product) => {
                      const quantity = newSaleQuantities[product.id] || 0;
                      return <div key={product.id} className="grid grid-cols-[1fr_70px_54px_96px] items-center border-b border-gray-100 px-3 py-2 last:border-b-0">
                        <div className="min-w-0"><p className="truncate text-[11px] font-bold text-[#1F2937]">{product.name}</p><p className="text-[10px] text-muted-foreground">{product.category}</p></div>
                        <span className="text-[10px] font-semibold">{product.sellPrice.toLocaleString()} Rwf</span>
                        <span className="justify-self-start rounded bg-[#DCFCE7] px-1.5 py-0.5 text-[10px] font-bold text-[#166534]">{product.quantity}</span>
                        <div className="ml-auto flex items-center rounded-md border border-border text-xs"><button type="button" onClick={() => updateNewSaleQuantity(product.id, -1)} className="p-1.5 hover:bg-gray-50" aria-label={`Remove ${product.name}`}><Minus className="h-3 w-3" /></button><span className="w-6 text-center font-semibold">{quantity}</span><button type="button" onClick={() => updateNewSaleQuantity(product.id, 1)} className="p-1.5 hover:bg-[#DCFCE7]" aria-label={`Add ${product.name}`}><Plus className="h-3 w-3" /></button></div>
                      </div>;
                    })}
                  </div>
                </>}
                {newSaleStep === 2 && <div className="space-y-4 py-3"><div><label className="mb-1.5 block text-xs font-bold">Client name</label><Input value={newSaleClient} onChange={(event) => setNewSaleClient(event.target.value)} placeholder="e.g. Mugisha Emmanuel" className="text-sm" /></div><label className="flex items-center gap-2 rounded-lg border border-border p-3 text-xs font-semibold"><input type="checkbox" checked={newSaleCredit} onChange={(event) => setNewSaleCredit(event.target.checked)} className="h-4 w-4 accent-[#15803D]" /> Credit sale (payment will be collected later)</label><p className="rounded-lg bg-[#F0FDF4] p-3 text-xs text-[#166534]">Cash payment due now: <strong>{(newSaleCredit ? 0 : newSaleTotal).toLocaleString()} Rwf</strong></p></div>}
                {newSaleStep === 3 && <div className="space-y-3 py-3 text-sm"><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Client</p><p className="mt-1 font-bold">{newSaleClient || "Unknown Client"}</p><div className="my-3 border-t border-border" /><p className="text-xs text-muted-foreground">Payment</p><p className="mt-1 font-bold">{newSaleCredit ? "Full credit" : "Cash"}</p><div className="my-3 border-t border-border" /><div className="flex justify-between font-bold"><span>Total</span><span className="text-[#15803D]">{newSaleTotal.toLocaleString()} Rwf</span></div></div></div>}
              </div>

              <div className="flex items-center justify-between border-t border-border px-5 py-3"><span className="text-[11px] font-semibold text-muted-foreground">Total items: {newSaleItemCount}</span><span className="text-[11px] font-bold text-[#15803D]">Total amount: {newSaleTotal.toLocaleString()} Rwf</span></div>
              <div className="flex justify-end gap-2 border-t border-border px-5 py-3"><Button variant="outline" size="sm" onClick={newSaleStep === 1 ? closeNewSale : () => setNewSaleStep((step) => step - 1)}>{newSaleStep === 1 ? "Cancel" : "Back"}</Button><Button size="sm" onClick={newSaleStep === 3 ? completeNewSale : () => setNewSaleStep((step) => step + 1)} disabled={newSaleStep === 1 && newSaleItemCount === 0} className="gap-1.5 bg-[#15803D] text-white hover:bg-[#166534]">{newSaleStep === 3 ? "Complete sale" : <>Next <ArrowRight className="h-3.5 w-3.5" /></>}</Button></div>
            </div>
          </div>
        )}

        {/* View Lines / Bill Modal */}
        {inspectedSale && renderPageOverlay(
          <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-border">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Ticket {inspectedSale.saleNumber}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Date: {inspectedSale.date} • Operator: {inspectedSale.operatorName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setInspectedSale(null)}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {inspectedSale.status === "cancelled" && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#DC2626]">
                  <strong>SALE CANCELLED:</strong> {inspectedSale.cancelReason} (by {inspectedSale.cancelledBy} on{" "}
                  {inspectedSale.cancelledAt?.substring(0, 10)})
                </div>
              )}

              {/* Printable Receipt Preview */}
              <div
                id="printable-receipt"
                className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-xs font-mono space-y-2"
              >
                <div className="text-center border-b border-gray-300 pb-2">
                  <p className="font-bold text-sm">{settings.shopName}</p>
                  <p className="text-[10px]">{settings.address}</p>
                  <p className="text-[10px]">TIN: {settings.tin} • Tel: {settings.phone}</p>
                  <p className="text-[10px] mt-1">Ticket: {inspectedSale.saleNumber}</p>
                  <p className="text-[10px]">Date: {inspectedSale.date} | Op: {inspectedSale.operatorName}</p>
                </div>

                <div className="divide-y divide-gray-200 py-1 text-[11px]">
                  {inspectedSale.lines.map((ln) => (
                    <div key={ln.id} className="py-1 flex justify-between">
                      <span>
                        {ln.quantity}x {ln.productName}
                      </span>
                      <span>{ln.lineTotal.toLocaleString()} Rwf</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 pt-1.5 space-y-0.5 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL:</span>
                    <span>{inspectedSale.total.toLocaleString()} Rwf</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Received:</span>
                    <span>{inspectedSale.paidAmount.toLocaleString()} Rwf</span>
                  </div>
                  {inspectedSale.creditAmount > 0 && (
                    <div className="flex justify-between text-[#DC2626] font-bold">
                      <span>Credit Debt:</span>
                      <span>{inspectedSale.creditAmount.toLocaleString()} Rwf</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span>{inspectedSale.clientName}</span>
                  </div>
                </div>

                <div className="text-center border-t border-gray-300 pt-2 text-[10px] text-muted-foreground">
                  <p>{settings.receiptFooter}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 gap-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold"
                >
                  <Printer className="w-4 h-4" />
                  Print Thermal Bill
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInspectedSale(null)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Sale Modal with Reason Input */}
        {saleToCancel && renderPageOverlay(
          <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Cancel Sale {saleToCancel.saleNumber}?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Total: {saleToCancel.total.toLocaleString()} Rwf • Operator: {saleToCancel.operatorName}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-bold">Automated Reversal Notice:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Product stock will be returned to inventory automatically.</li>
                  <li>{saleToCancel.paidAmount.toLocaleString()} Rwf cash will be deducted from Caisse.</li>
                  <li>Debt will be cleared if credit was provided.</li>
                  <li>The sale record is preserved and flagged as cancelled (audit log).</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]">
                  Cancellation Reason <span className="text-[#DC2626]">* (Mandatory)</span>
                </label>
                <Input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer returned items, wrong barcode selected..."
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSaleToCancel(null)}
                  className="flex-1"
                >
                  Keep Sale
                </Button>
                <Button
                  disabled={!cancelReason.trim()}
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white font-bold"
                >
                  Confirm Reversal
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
