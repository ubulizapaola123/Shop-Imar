"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import {
  BarChart3,
  Calendar,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Flame,
  ArrowDownRight,
  RotateCw,
  Lock,
  Layers,
  Users,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProfitReportsPage() {
  const {
    sales,
    products,
    incomes,
    outputs,
    creditPayments,
    currentUser,
    hasPermission,
    settings,
  } = useSellPoint();

  const todayStr = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [toDate, setToDate] = useState(todayStr);

  // Active Report Tab: "sales_summary" | "by_product" | "by_operator" | "stock_value" | "credit_report" | "income_output"
  const [activeTab, setActiveTab] = useState<
    "sales_summary" | "by_product" | "by_operator" | "stock_value" | "credit_report" | "income_output"
  >("sales_summary");

  const [isCalculated, setIsCalculated] = useState(true);

  if (!hasPermission("Manager")) {
    return (
      <AdminLayout>
        <div className="p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1F2937]">Access Denied</h3>
          <p className="text-xs text-muted-foreground">
            Cashiers are not permitted to view Profit &amp; Financial Reports.
          </p>
        </div>
      </AdminLayout>
    );
  }

  // Filter entities by date range
  const filteredSales = sales.filter(
    (s) => s.status === "completed" && s.date >= fromDate && s.date <= toDate
  );

  const filteredIncomes = incomes.filter(
    (i) => i.status === "active" && i.date >= fromDate && i.date <= toDate
  );

  const filteredOutputs = outputs.filter(
    (o) => o.status === "active" && o.date >= fromDate && o.date <= toDate
  );

  // Profit calculation:
  // Profit = sales revenue - cost of goods sold - outputs + other income
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);

  const totalCostOfGoodsSold = filteredSales.reduce((acc, s) => {
    return (
      acc +
      s.lines.reduce((lAcc, ln) => lAcc + ln.costPrice * ln.quantity, 0)
    );
  }, 0);

  const totalOtherIncome = filteredIncomes.reduce((acc, i) => acc + i.amount, 0);
  const totalOutputs = filteredOutputs.reduce((acc, o) => acc + o.amount, 0);

  const netProfit = totalSalesRevenue - totalCostOfGoodsSold - totalOutputs + totalOtherIncome;

  // Consumption analysis (by Product lines)
  const productConsumptionMap: Record<
    string,
    { name: string; quantitySold: number; revenue: number; cost: number; profit: number }
  > = {};

  filteredSales.forEach((s) => {
    s.lines.forEach((ln) => {
      if (!productConsumptionMap[ln.productId]) {
        productConsumptionMap[ln.productId] = {
          name: ln.productName,
          quantitySold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        };
      }
      const entry = productConsumptionMap[ln.productId];
      entry.quantitySold += ln.quantity;
      entry.revenue += ln.lineTotal;
      entry.cost += ln.costPrice * ln.quantity;
      entry.profit += ln.lineTotal - ln.costPrice * ln.quantity;
    });
  });

  const consumptionList = Object.values(productConsumptionMap);

  // Most consumed item (highest quantity)
  const mostConsumed = [...consumptionList].sort((a, b) => b.quantitySold - a.quantitySold)[0];

  // Highest profit item
  const highestProfitItem = [...consumptionList].sort((a, b) => b.profit - a.profit)[0];

  // Least consumed item
  const leastConsumed = [...consumptionList].sort((a, b) => a.quantitySold - b.quantitySold)[0];

  // Sales by Operator
  const operatorMap: Record<string, { name: string; totalSales: number; count: number }> = {};
  filteredSales.forEach((s) => {
    if (!operatorMap[s.operatorId]) {
      operatorMap[s.operatorId] = {
        name: s.operatorName,
        totalSales: 0,
        count: 0,
      };
    }
    operatorMap[s.operatorId].totalSales += s.total;
    operatorMap[s.operatorId].count++;
  });

  // Stock Report and Value
  const totalStockQuantity = products.filter((p) => !p.archived).reduce((acc, p) => acc + p.quantity, 0);
  const totalStockCostValue = products.filter((p) => !p.archived).reduce((acc, p) => acc + p.buyPrice * p.quantity, 0);
  const totalStockRetailValue = products.filter((p) => !p.archived).reduce((acc, p) => acc + p.sellPrice * p.quantity, 0);

  const handleCalculate = () => {
    setIsCalculated(true);
    toast.success("Financial metrics calculated for selected period");
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvData = "";
    if (activeTab === "by_product") {
      const headers = ["Product_Name", "Quantity_Sold", "Revenue_Rwf", "Cost_Rwf", "Profit_Rwf"];
      const rows = consumptionList.map((c) => [
        `"${c.name}"`,
        c.quantitySold,
        c.revenue,
        c.cost,
        c.profit,
      ]);
      csvData = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else {
      const headers = ["Metric", "Amount_Rwf"];
      const rows = [
        ["Total Sales Revenue", totalSalesRevenue],
        ["Cost of Goods Sold", totalCostOfGoodsSold],
        ["Other Income", totalOtherIncome],
        ["Expenses / Outputs", totalOutputs],
        ["Net Profit", netProfit],
      ];
      csvData = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sellpoint_report_${activeTab}_${fromDate}_to_${toDate}.csv`;
    link.click();
    toast.success("Report downloaded in CSV format");
  };

  const fmtRwf = (amt: number) => `${amt.toLocaleString()} Rwf`;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#15803D]" />
              Profit &amp; Financial Reports
            </h2>
            <p className="text-xs text-muted-foreground">
              Profit formula: Sales Revenue &minus; Cost of Goods Sold &minus; Outputs + Other Income (in Rwf)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintReport}
              className="gap-1.5 border-border hover:bg-gray-100"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 border-emerald-300 text-[#166534] hover:bg-[#DCFCE7]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV / Excel
            </Button>
          </div>
        </div>

        {/* Date Filter & Calculate Button */}
        <Card className="p-4 border-border bg-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">From Date:</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 text-xs w-36"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">To Date:</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 text-xs w-36"
              />
            </div>

            <Button
              onClick={handleCalculate}
              className="gap-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold h-9 text-xs shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Calculate Period
            </Button>
          </div>

          <div className="text-xs font-semibold text-muted-foreground">
            Period: <strong className="text-[#1F2937]">{fromDate}</strong> to <strong className="text-[#1F2937]">{toDate}</strong>
          </div>
        </Card>

        {/* 4 Summary Highlight Cards:
            1. Total Profit
            2. Most Consumed Item
            3. Highest-Profit Item
            4. Least Consumed Item */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Profit */}
          <Card className="p-5 border-emerald-300 bg-gradient-to-br from-white to-[#DCFCE7]/50 shadow-sm space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] flex items-center justify-between">
              Net Profit for Period
              <TrendingUp className="w-4 h-4 text-[#15803D]" />
            </span>
            <div className={cn("text-2xl font-black", netProfit >= 0 ? "text-[#15803D]" : "text-[#DC2626]")}>
              {fmtRwf(netProfit)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sales ({fmtRwf(totalSalesRevenue)}) &minus; Cost ({fmtRwf(totalCostOfGoodsSold)}) &minus; Exp ({fmtRwf(totalOutputs)}) + Inc ({fmtRwf(totalOtherIncome)})
            </p>
          </Card>

          {/* Most Consumed Item */}
          <Card className="p-5 border-border bg-white shadow-sm space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Most Consumed Product
              <Flame className="w-4 h-4 text-[#F59E0B]" />
            </span>
            <div className="text-base font-bold text-[#1F2937] truncate" title={mostConsumed?.name || "None"}>
              {mostConsumed ? mostConsumed.name : "No sales recorded"}
            </div>
            <p className="text-[11px] text-[#15803D] font-semibold">
              {mostConsumed ? `${mostConsumed.quantitySold} units sold (${fmtRwf(mostConsumed.revenue)})` : "-"}
            </p>
          </Card>

          {/* Highest-Profit Item */}
          <Card className="p-5 border-border bg-white shadow-sm space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Highest Margin Item
              <Award className="w-4 h-4 text-[#15803D]" />
            </span>
            <div className="text-base font-bold text-[#1F2937] truncate" title={highestProfitItem?.name || "None"}>
              {highestProfitItem ? highestProfitItem.name : "No sales recorded"}
            </div>
            <p className="text-[11px] text-[#15803D] font-bold">
              {highestProfitItem ? `+${fmtRwf(highestProfitItem.profit)} profit generated` : "-"}
            </p>
          </Card>

          {/* Least Consumed Item */}
          <Card className="p-5 border-border bg-white shadow-sm space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Least Consumed Product
              <ArrowDownRight className="w-4 h-4 text-gray-400" />
            </span>
            <div className="text-base font-bold text-[#1F2937] truncate" title={leastConsumed?.name || "None"}>
              {leastConsumed ? leastConsumed.name : "No sales recorded"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {leastConsumed ? `${leastConsumed.quantitySold} units sold` : "-"}
            </p>
          </Card>
        </div>

        {/* Reports Navigation Tabs */}
        <div className="border-b border-border flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("sales_summary")}
            className={cn(
              "px-4 py-2.5 text-xs font-bold border-b-2 transition-all",
              activeTab === "sales_summary"
                ? "border-[#15803D] text-[#166534] bg-[#DCFCE7]/30"
                : "border-transparent text-muted-foreground hover:text-black"
            )}
          >
            Financial Summary
          </button>
          <button
            onClick={() => setActiveTab("by_product")}
            className={cn(
              "px-4 py-2.5 text-xs font-bold border-b-2 transition-all",
              activeTab === "by_product"
                ? "border-[#15803D] text-[#166534] bg-[#DCFCE7]/30"
                : "border-transparent text-muted-foreground hover:text-black"
            )}
          >
            Sales by Product
          </button>
          <button
            onClick={() => setActiveTab("by_operator")}
            className={cn(
              "px-4 py-2.5 text-xs font-bold border-b-2 transition-all",
              activeTab === "by_operator"
                ? "border-[#15803D] text-[#166534] bg-[#DCFCE7]/30"
                : "border-transparent text-muted-foreground hover:text-black"
            )}
          >
            Sales by Operator
          </button>
          <button
            onClick={() => setActiveTab("stock_value")}
            className={cn(
              "px-4 py-2.5 text-xs font-bold border-b-2 transition-all",
              activeTab === "stock_value"
                ? "border-[#15803D] text-[#166534] bg-[#DCFCE7]/30"
                : "border-transparent text-muted-foreground hover:text-black"
            )}
          >
            Stock Value Report
          </button>
          <button
            onClick={() => setActiveTab("credit_report")}
            className={cn(
              "px-4 py-2.5 text-xs font-bold border-b-2 transition-all",
              activeTab === "credit_report"
                ? "border-[#15803D] text-[#166534] bg-[#DCFCE7]/30"
                : "border-transparent text-muted-foreground hover:text-black"
            )}
          >
            Credit Report
          </button>
          <button
            onClick={() => setActiveTab("income_output")}
            className={cn(
              "px-4 py-2.5 text-xs font-bold border-b-2 transition-all",
              activeTab === "income_output"
                ? "border-[#15803D] text-[#166534] bg-[#DCFCE7]/30"
                : "border-transparent text-muted-foreground hover:text-black"
            )}
          >
            Income &amp; Output Report
          </button>
        </div>

        {/* Tab 1: Financial Summary */}
        {activeTab === "sales_summary" && (
          <Card className="p-6 border-border bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1F2937]">Profit Breakdown &amp; Audit</h3>
            <div className="divide-y divide-border text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-[#1F2937]">(+) Gross Sales Revenue</span>
                <span className="font-bold text-[#15803D]">{fmtRwf(totalSalesRevenue)}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">(&minus;) Cost of Goods Sold (COGS)</span>
                <span className="font-bold text-muted-foreground">{fmtRwf(totalCostOfGoodsSold)}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center bg-[#DCFCE7]/20 px-2 rounded">
                <span className="font-bold text-[#166534]">= Gross Sales Margin</span>
                <span className="font-black text-[#166534]">
                  {fmtRwf(totalSalesRevenue - totalCostOfGoodsSold)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-[#15803D]">(+) Other Operational Income</span>
                <span className="font-bold text-[#15803D]">+{fmtRwf(totalOtherIncome)}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-[#DC2626]">(&minus;) Outputs (Counter Expenses)</span>
                <span className="font-bold text-[#DC2626]">&minus;{fmtRwf(totalOutputs)}</span>
              </div>
              <div className="py-3 flex justify-between items-center bg-[#DCFCE7] px-3 rounded-lg text-sm">
                <span className="font-black text-[#166534]">NET PROFIT (RWANDAN FRANCS)</span>
                <span className="font-black text-[#166534] text-base">{fmtRwf(netProfit)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: Sales by Product */}
        {activeTab === "by_product" && (
          <Card className="border-border overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DCFCE7] text-[#166534] font-bold sticky top-0 z-10 border-b border-emerald-200">
                  <tr>
                    <th className="py-2.5 px-4">Product Name</th>
                    <th className="py-2.5 px-4 text-right">Units Sold</th>
                    <th className="py-2.5 px-4 text-right">Revenue (Rwf)</th>
                    <th className="py-2.5 px-4 text-right">Cost (Rwf)</th>
                    <th className="py-2.5 px-4 text-right">Gross Profit (Rwf)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {consumptionList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-muted-foreground">
                        No product sales recorded in this date range.
                      </td>
                    </tr>
                  ) : (
                    consumptionList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#DCFCE7]/20">
                        <td className="py-2.5 px-4 font-semibold text-[#1F2937]">{item.name}</td>
                        <td className="py-2.5 px-4 text-right font-bold">{item.quantitySold}</td>
                        <td className="py-2.5 px-4 text-right">{fmtRwf(item.revenue)}</td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground">{fmtRwf(item.cost)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-[#15803D]">
                          +{fmtRwf(item.profit)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 3: Sales by Operator */}
        {activeTab === "by_operator" && (
          <Card className="border-border overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DCFCE7] text-[#166534] font-bold border-b border-emerald-200">
                  <tr>
                    <th className="py-3 px-4">Operator Name</th>
                    <th className="py-3 px-4 text-right">Number of Tickets</th>
                    <th className="py-3 px-4 text-right">Total Revenue (Rwf)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.values(operatorMap).map((op, idx) => (
                    <tr key={idx} className="hover:bg-[#DCFCE7]/20">
                      <td className="py-3 px-4 font-bold text-[#1F2937]">{op.name}</td>
                      <td className="py-3 px-4 text-right font-semibold">{op.count} tickets</td>
                      <td className="py-3 px-4 text-right font-bold text-[#15803D]">
                        {fmtRwf(op.totalSales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 4: Stock Value Report */}
        {activeTab === "stock_value" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 border-border bg-white text-center">
                <span className="text-xs text-muted-foreground font-bold uppercase">Total Units in Stock</span>
                <p className="text-xl font-bold text-[#1F2937] mt-1">{totalStockQuantity} items</p>
              </Card>
              <Card className="p-4 border-border bg-white text-center">
                <span className="text-xs text-muted-foreground font-bold uppercase">Stock Cost Value (Buy Price)</span>
                <p className="text-xl font-bold text-[#15803D] mt-1">{fmtRwf(totalStockCostValue)}</p>
              </Card>
              <Card className="p-4 border-border bg-white text-center">
                <span className="text-xs text-muted-foreground font-bold uppercase">Stock Potential Retail Value</span>
                <p className="text-xl font-bold text-[#166534] mt-1">{fmtRwf(totalStockRetailValue)}</p>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 5: Credit Report */}
        {activeTab === "credit_report" && (
          <Card className="p-6 border-border bg-white shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#1F2937]">Credit Portfolio Breakdown</h3>
            <p className="text-xs text-muted-foreground">
              Review debts generated, recovered cash, and outstanding balances.
            </p>
            <div className="divide-y divide-border text-xs pt-2">
              <div className="py-2.5 flex justify-between">
                <span>Credit issued in this period:</span>
                <span className="font-bold text-amber-700">
                  {fmtRwf(filteredSales.reduce((acc, s) => acc + s.creditAmount, 0))}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Total overall uncollected customer debt:</span>
                <span className="font-bold text-[#DC2626]">
                  {fmtRwf(
                    sales
                      .filter((s) => s.status === "completed")
                      .reduce((acc, s) => acc + s.creditAmount, 0) -
                      creditPayments.reduce((acc, cp) => acc + cp.amount, 0)
                  )}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 6: Income & Output Report */}
        {activeTab === "income_output" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-border bg-white space-y-2">
              <h4 className="text-xs font-bold text-[#15803D] uppercase">Period Other Incomes</h4>
              <p className="text-xl font-bold text-[#15803D]">+{fmtRwf(totalOtherIncome)}</p>
              <p className="text-xs text-muted-foreground">{filteredIncomes.length} records</p>
            </Card>

            <Card className="p-4 border-border bg-white space-y-2">
              <h4 className="text-xs font-bold text-[#DC2626] uppercase">Period Expenses (Outputs)</h4>
              <p className="text-xl font-bold text-[#DC2626]">&minus;{fmtRwf(totalOutputs)}</p>
              <p className="text-xs text-muted-foreground">{filteredOutputs.length} records</p>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
