"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import {
  TrendingDown,
  CreditCard,
  CheckCircle2,
  ShoppingCart,
  Wallet,
  RotateCw,
  Search,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Plus,
  ChevronLeft,
  ChevronRight,
  Activity,
  Store,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PAGE_SIZE_STOCK = 5;
const PAGE_SIZE_SALES = 5;

export default function Dashboard() {
  const router = useRouter();
  const { products, sales, creditPayments, outputs, incomes, settings } = useSellPoint();
  const [stockSearch, setStockSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stockPage, setStockPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);

  const todayStr = new Date().toISOString().split("T")[0];

  // — KPI Calculations —
  const todaySales = sales.filter((s) => s.date === todayStr && s.status === "completed");
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.total, 0);
  const todayCreditSales = todaySales.reduce((acc, s) => acc + s.creditAmount, 0);
  const todayPaidCredit = creditPayments
    .filter((cp) => cp.paymentDate === todayStr)
    .reduce((acc, cp) => acc + cp.amount, 0);
  const todayOutputsTotal = outputs
    .filter((o) => o.date === todayStr && o.status === "active")
    .reduce((acc, o) => acc + o.amount, 0);

  // Total outstanding credit
  const totalOutstandingCredit = sales
    .filter((s) => s.creditAmount > 0 && s.status === "completed")
    .reduce((acc, s) => {
      const paid = creditPayments
        .filter((cp) => cp.saleId === s.id)
        .reduce((a, cp) => a + cp.amount, 0);
      return acc + Math.max(0, s.creditAmount - paid);
    }, 0);

  // Total stock value
  const totalStockValue = products
    .filter((p) => !p.archived)
    .reduce((acc, p) => acc + p.buyPrice * p.quantity, 0);
  const totalProductCount = products.filter((p) => !p.archived).length;

  // Net profit today
  const todayIncomes = incomes
    .filter((i) => i.date === todayStr && i.status === "active")
    .reduce((acc, i) => acc + i.amount, 0);
  const todayNetProfit = todaySalesTotal + todayIncomes - todayOutputsTotal;

  const lowStockProducts = products.filter((p) => !p.archived && p.quantity <= p.minStock);
  const lowStockCount = lowStockProducts.length;

  // — Stock table with search & pagination —
  const filteredProducts = products
    .filter((p) => !p.archived)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(stockSearch.toLowerCase())
    );
  const stockTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE_STOCK));
  const pagedProducts = filteredProducts.slice(
    (stockPage - 1) * PAGE_SIZE_STOCK,
    stockPage * PAGE_SIZE_STOCK
  );

  // — Sales table with pagination —
  const salesTotalPages = Math.max(1, Math.ceil(todaySales.length / PAGE_SIZE_SALES));
  const pagedSales = todaySales.slice(
    (salesPage - 1) * PAGE_SIZE_SALES,
    salesPage * PAGE_SIZE_SALES
  );

  // — Recent activity feed — (last 6 events across sales, restocks, credit payments)
  type ActivityItem = { id: string; icon: "sale" | "stock" | "payment"; label: string; sub: string; time: string };
  const activityItems: ActivityItem[] = [
    ...todaySales.slice(0, 3).map((s) => ({
      id: s.id,
      icon: "sale" as const,
      label: `Sale completed – ${s.total.toLocaleString()} Rwf`,
      sub: `${s.lines.length} item${s.lines.length !== 1 ? "s" : ""} • ${s.date}`,
      time: s.date,
    })),
    ...creditPayments.slice(0, 2).map((cp) => ({
      id: cp.id,
      icon: "payment" as const,
      label: `Credit received – ${cp.amount.toLocaleString()} Rwf`,
      sub: `Payment recorded • ${cp.paymentDate}`,
      time: cp.paymentDate,
    })),
  ].slice(0, 6);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Dashboard refreshed");
    }, 400);
  };

  const fmtRwf = (amt: number) => `${amt.toLocaleString()} Rwf`;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1600px] space-y-5 p-5 md:p-7">

        {/* ── Page Header ── */}
        <div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937] tracking-tight">Dashboard</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-RW", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
              {" "}• Counter Guichet #1
            </p>
          </div>
        </div>

        {/* ── 4 KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Sales */}
          <Link href="/sell-list" className="group block">
            <Card className="p-4 border-border hover:border-emerald-400 hover:shadow-md transition-all bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Today's Sales</span>
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#166534]">{fmtRwf(todaySalesTotal)}</div>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>{todaySales.length} sale{todaySales.length !== 1 ? "s" : ""} today</span>
                <span className="ml-auto text-[#15803D] font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
              </div>
            </Card>
          </Link>

          {/* Today's Expenses */}
          <Link href="/output" className="group block">
            <Card className="p-4 border-border hover:border-red-300 hover:shadow-md transition-all bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Today's Expenses</span>
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#1F2937]">{fmtRwf(todayOutputsTotal)}</div>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>{outputs.filter((o) => o.date === todayStr).length} expense{outputs.filter((o) => o.date === todayStr).length !== 1 ? "s" : ""} today</span>
                <span className="ml-auto text-red-500 font-semibold flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" /> +3%
                </span>
              </div>
            </Card>
          </Link>

          {/* Credit Given */}
          <Link href="/credit" className="group block">
            <Card className="p-4 border-border hover:border-amber-300 hover:shadow-md transition-all bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Credit Given</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#1F2937]">{fmtRwf(todayCreditSales)}</div>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>{todaySales.filter((s) => s.creditAmount > 0).length} client{todaySales.filter((s) => s.creditAmount > 0).length !== 1 ? "s" : ""}</span>
                <span className="ml-auto text-amber-500 font-semibold flex items-center gap-0.5">
                  +8%
                </span>
              </div>
            </Card>
          </Link>

          {/* Credit Paid */}
          <Link href="/credit" className="group block">
            <Card className="p-4 border-border hover:border-emerald-400 hover:shadow-md transition-all bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Credit Paid</span>
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#15803D]">{fmtRwf(todayPaidCredit)}</div>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>1 payment</span>
                <span className="ml-auto text-[#15803D] font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +20%
                </span>
              </div>
            </Card>
          </Link>
        </div>

        {/* ── Quick Actions ── */}
        <div className="rounded-xl border border-emerald-100 bg-[#F0FDF4]/75 p-4">
          <h3 className="text-sm font-bold text-[#1F2937]">Quick Actions</h3>
          <p className="mb-3 text-xs text-muted-foreground">Access common operations quickly.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button asChild size="sm" className="bg-[#15803D] hover:bg-[#166534] text-white gap-2 h-10 font-semibold shadow-sm">
              <Link href="/sell">
                <ShoppingCart className="w-4 h-4" /> New Sale
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-[#DCFCE7] hover:text-[#166534] gap-2 h-10 font-medium bg-white">
              <Link href="/sell">
                <Package className="w-4 h-4 text-[#15803D]" /> Open POS
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-[#DCFCE7] hover:text-[#166534] gap-2 h-10 font-medium bg-white">
              <Link href="/buy">
                <Plus className="w-4 h-4 text-[#15803D]" /> Add Stock
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-[#DCFCE7] hover:text-[#166534] gap-2 h-10 font-medium bg-white">
              <Link href="/credit">
                <CreditCard className="w-4 h-4 text-[#15803D]" /> Receive Payment
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Three-column section ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Inventory Status (5 cols) */}
          <div className="xl:col-span-5 bg-white rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-[#DCFCE7]/20">
              <div>
                <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#15803D]" /> Inventory Status
                </h3>
                <div className="flex items-center gap-4 mt-1 text-xs">
                  <span className="text-red-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {lowStockCount} Low
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {fmtRwf(totalStockValue)} Stock Value
                  </span>
                  <span className="text-[#166534] font-semibold">{totalProductCount} Total</span>
                </div>
              </div>
              <Link href="/stock" className="text-xs text-[#15803D] font-bold hover:underline flex items-center gap-1">
                View Stock <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Search */}
            <div className="px-4 py-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={stockSearch}
                  onChange={(e) => { setStockSearch(e.target.value); setStockPage(1); }}
                  placeholder="Filter stock items..."
                  className="pl-8 h-8 text-xs bg-white"
                />
              </div>
            </div>

            {/* Low stock table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DCFCE7] text-[#166534] font-bold border-b border-emerald-200">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Stock</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pagedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">No products found.</td>
                    </tr>
                  ) : (
                    pagedProducts.map((p) => {
                      const isLow = p.quantity <= p.minStock;
                      const isOut = p.quantity === 0;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => router.push("/stock")}
                          className={cn(
                            "cursor-pointer transition-colors",
                            isOut ? "bg-red-50/60 hover:bg-red-100/60"
                              : isLow ? "bg-amber-50/70 hover:bg-amber-100/70"
                              : "hover:bg-[#DCFCE7]/30"
                          )}
                        >
                          <td className="py-2.5 px-3 font-semibold text-[#1F2937] max-w-[120px] truncate">{p.name}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{p.category}</td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            <span className={cn(isOut ? "text-[#DC2626]" : isLow ? "text-[#F59E0B]" : "text-[#166534]")}>
                              {p.quantity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isOut ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-[#DC2626]">OUT</span>
                            ) : isLow ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Low</span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-border bg-gray-50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Showing {Math.min((stockPage - 1) * PAGE_SIZE_STOCK + 1, filteredProducts.length)}–{Math.min(stockPage * PAGE_SIZE_STOCK, filteredProducts.length)} of {filteredProducts.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStockPage((p) => Math.max(1, p - 1))}
                  disabled={stockPage === 1}
                  className="p-1 rounded hover:bg-[#DCFCE7] disabled:opacity-40 text-[#166534]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: stockTotalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setStockPage(n)}
                    className={cn(
                      "w-6 h-6 rounded text-[11px] font-semibold",
                      n === stockPage ? "bg-[#15803D] text-white" : "hover:bg-[#DCFCE7] text-[#166534]"
                    )}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setStockPage((p) => Math.min(stockTotalPages, p + 1))}
                  disabled={stockPage === stockTotalPages}
                  className="p-1 rounded hover:bg-[#DCFCE7] disabled:opacity-40 text-[#166534]"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Sales (4 cols) */}
          <div className="xl:col-span-4 bg-white rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-[#DCFCE7]/20">
              <div>
                <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#15803D]" /> Recent Sales
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Today's transactions</p>
              </div>
              <Link href="/sell-list" className="text-xs text-[#15803D] font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DCFCE7] text-[#166534] font-bold border-b border-emerald-200">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pagedSales.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center">
                        <p className="text-muted-foreground mb-2">No sales yet today.</p>
                        <Button asChild size="sm" className="bg-[#15803D] text-white">
                          <Link href="/sell">Start First Sale</Link>
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    pagedSales.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => router.push("/sell-list")}
                        className="hover:bg-[#DCFCE7]/30 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-[#15803D] block text-[11px]">{s.saleNumber}</span>
                          <span className="text-muted-foreground text-[11px] block">{s.lines.length} item{s.lines.length !== 1 ? "s" : ""}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="font-bold text-[#1F2937]">{s.total.toLocaleString()} Rwf</span>
                          {s.creditAmount > 0 && (
                            <span className="block text-[10px] text-amber-700 font-semibold">{s.creditAmount.toLocaleString()} Rwf debt</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">Paid</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-border bg-gray-50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {todaySales.length > 0
                  ? `Showing ${Math.min((salesPage - 1) * PAGE_SIZE_SALES + 1, todaySales.length)}–${Math.min(salesPage * PAGE_SIZE_SALES, todaySales.length)} of ${todaySales.length}`
                  : "No sales today"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
                  disabled={salesPage === 1}
                  className="p-1 rounded hover:bg-[#DCFCE7] disabled:opacity-40 text-[#166534]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: salesTotalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setSalesPage(n)}
                    className={cn(
                      "w-6 h-6 rounded text-[11px] font-semibold",
                      n === salesPage ? "bg-[#15803D] text-white" : "hover:bg-[#DCFCE7] text-[#166534]"
                    )}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setSalesPage((p) => Math.min(salesTotalPages, p + 1))}
                  disabled={salesPage === salesTotalPages}
                  className="p-1 rounded hover:bg-[#DCFCE7] disabled:opacity-40 text-[#166534]"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Finance Overview (3 cols) */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            {/* Finance summary card */}
            <Card className="p-4 border-border bg-white shadow-sm">
              <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-[#15803D]" /> Finance Overview
                <Link href="/profit" className="ml-auto text-xs text-[#15803D] font-bold hover:underline flex items-center gap-1">
                  View Reports <ArrowRight className="w-3 h-3" />
                </Link>
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Total Sales</span>
                  <span className="text-sm font-black text-[#166534]">{fmtRwf(todaySalesTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Total Expenses</span>
                  <span className="text-sm font-bold text-[#DC2626]">{fmtRwf(todayOutputsTotal)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#1F2937]">Net Profit</span>
                  <span className={cn("text-sm font-black", todayNetProfit >= 0 ? "text-[#15803D]" : "text-[#DC2626]")}>
                    {fmtRwf(todayNetProfit)}
                  </span>
                </div>
                {todaySalesTotal > 0 && (
                  <div className="text-[11px] text-muted-foreground flex gap-2 pt-1">
                    <span className="text-[#15803D] font-semibold">↑ 12%</span> sales •
                    <span className="text-red-500 font-semibold">↑ 5%</span> expenses •
                    <span className="text-[#15803D] font-semibold">↑ 8%</span> profit
                  </div>
                )}
              </div>
            </Card>

            {/* Cash & Credit Summary */}
            <Card className="p-4 border-border bg-white shadow-sm">
              <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-[#15803D]" /> Cash & Credit
              </h3>
              <div className="space-y-2.5">
                <Link href="/caisse" className="flex justify-between items-center group">
                  <span className="text-xs text-muted-foreground group-hover:text-[#166534] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#15803D]" /> Cash in Caisse
                  </span>
                  <span className="text-sm font-black text-[#166534]">{fmtRwf(settings.caisseBalance)}</span>
                </Link>
                <Link href="/credit" className="flex justify-between items-center group">
                  <span className="text-xs text-muted-foreground group-hover:text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Credit Outstanding
                  </span>
                  <span className="text-sm font-bold text-amber-700">{fmtRwf(totalOutstandingCredit)}</span>
                </Link>
                <Link href="/credit" className="flex justify-between items-center group">
                  <span className="text-xs text-muted-foreground group-hover:text-[#15803D] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Credit Received
                  </span>
                  <span className="text-sm font-bold text-[#15803D]">{fmtRwf(todayPaidCredit)}</span>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Bottom Row: Recent Activity + Stock CTA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-[#DCFCE7]/20">
              <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#15803D]" /> Recent Activity
              </h3>
              <Link href="/sell-list" className="text-xs text-[#15803D] font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {activityItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No activity yet today.</div>
              ) : (
                activityItems.map((item) => {
                  const colors = {
                    sale: "bg-[#DCFCE7] text-[#15803D]",
                    stock: "bg-blue-50 text-blue-600",
                    payment: "bg-amber-50 text-amber-700",
                  };
                  const labels = { sale: "Sale", stock: "Stock", payment: "Payment" };
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colors[item.icon])}>
                        {item.icon === "sale" && <ShoppingCart className="w-3.5 h-3.5" />}
                        {item.icon === "stock" && <Package className="w-3.5 h-3.5" />}
                        {item.icon === "payment" && <CreditCard className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1F2937] truncate">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.sub}</p>
                      </div>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded shrink-0", colors[item.icon])}>
                        {labels[item.icon]}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Keep stock updated CTA */}
          <div className="bg-gradient-to-br from-[#DCFCE7] to-white rounded-xl border border-emerald-200 shadow-sm p-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#15803D] flex items-center justify-center shadow-lg shadow-emerald-200">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#166534]">Keep your stock updated</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Low stock items can lead to missed sales. Restock in time!
              </p>
            </div>
            <Button asChild className="bg-[#15803D] hover:bg-[#166534] text-white gap-2 w-full font-semibold">
              <Link href="/stock">
                Go to Stock <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
