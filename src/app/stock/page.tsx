"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import { Product } from "@/types/sellpoint";
import {
  Package,
  Search,
  Plus,
  Save,
  RotateCw,
  Trash2,
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  CheckCircle2,
  PenTool,
  Archive,
  Filter,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function StockPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    correctStock,
    importProducts,
    hasPermission,
    currentUser,
  } = useSellPoint();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  // Selected Product for Form
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Groceries");
  const [formBuyPrice, setFormBuyPrice] = useState<number | "">("");
  const [formSellPrice, setFormSellPrice] = useState<number | "">("");
  const [formQuantity, setFormQuantity] = useState<number | "">("");
  const [formMinStock, setFormMinStock] = useState<number | "">("");

  // Correction Modal
  const [correctionProduct, setCorrectionProduct] = useState<Product | null>(null);
  const [correctionNewQty, setCorrectionNewQty] = useState<number>(0);
  const [correctionReason, setCorrectionReason] = useState("");

  const categories = [
    "Groceries",
    "Beverages",
    "Dairy",
    "Soft Drinks",
    "Alcohol & Beer",
    "Hygiene",
    "Cleaning",
    "Snacks",
    "Other",
  ];

  // Filter products
  const activeProducts = products.filter((p) => !p.archived);
  const filteredProducts = activeProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (stockFilter === "low") {
      return matchesSearch && p.quantity <= p.minStock && p.quantity > 0;
    }
    if (stockFilter === "out") {
      return matchesSearch && p.quantity === 0;
    }
    return matchesSearch;
  });

  const handleSelectProduct = (p: Product) => {
    setSelectedProductId(p.id);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormBuyPrice(p.buyPrice);
    setFormSellPrice(p.sellPrice);
    setFormQuantity(p.quantity);
    setFormMinStock(p.minStock);
  };

  const handleNew = () => {
    setSelectedProductId(null);
    setFormName("");
    setFormCategory("Groceries");
    setFormBuyPrice("");
    setFormSellPrice("");
    setFormQuantity("");
    setFormMinStock(5);
  };

  const handleSaveOrUpdate = () => {
    if (!formName.trim()) {
      toast.error("Product name is mandatory");
      return;
    }
    if (typeof formSellPrice !== "number" || formSellPrice < 0) {
      toast.error("Valid selling price in Rwf is required");
      return;
    }
    if (typeof formBuyPrice !== "number" || formBuyPrice < 0) {
      toast.error("Valid buying price in Rwf is required");
      return;
    }

    const qty = typeof formQuantity === "number" ? formQuantity : 0;
    const minStk = typeof formMinStock === "number" ? formMinStock : 5;

    if (selectedProductId) {
      // Update
      const res = updateProduct(selectedProductId, {
        name: formName.trim(),
        category: formCategory,
        buyPrice: formBuyPrice,
        sellPrice: formSellPrice,
        quantity: qty,
        minStock: minStk,
      });
      if (res.success) {
        toast.success("Product updated successfully");
      } else {
        toast.error(res.error || "Update failed");
      }
    } else {
      // New Save
      const res = addProduct({
        name: formName.trim(),
        category: formCategory,
        buyPrice: formBuyPrice,
        sellPrice: formSellPrice,
        quantity: qty,
        minStock: minStk,
      });
      if (res.success) {
        toast.success("Product created and saved successfully");
        handleNew();
      } else {
        toast.error(res.error || "Failed to add product");
      }
    }
  };

  const handleDelete = () => {
    if (!selectedProductId) return;
    if (!window.confirm("Are you sure you want to delete / archive this product?")) {
      return;
    }
    const res = deleteProduct(selectedProductId);
    if (res.success) {
      toast.success("Product deleted / archived safely");
      handleNew();
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  const handleOpenCorrection = (p: Product) => {
    setCorrectionProduct(p);
    setCorrectionNewQty(p.quantity);
    setCorrectionReason("");
  };

  const handleSaveCorrection = () => {
    if (!correctionProduct) return;
    if (!correctionReason.trim()) {
      toast.error("Correction reason (e.g. damaged, broken, expired) is mandatory");
      return;
    }

    const res = correctStock(correctionProduct.id, correctionNewQty, correctionReason.trim());
    if (res.success) {
      toast.success(`Stock corrected to ${correctionNewQty} units. Logged in audit.`);
      setCorrectionProduct(null);
      // update form if current is selected
      if (selectedProductId === correctionProduct.id) {
        setFormQuantity(correctionNewQty);
      }
    } else {
      toast.error(res.error || "Failed to correct stock");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Category", "BuyPrice_Rwf", "SellPrice_Rwf", "Quantity", "MinStock"];
    const rows = activeProducts.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.buyPrice,
      p.sellPrice,
      p.quantity,
      p.minStock,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sellpoint_inventory_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory exported to CSV");
  };

  // CSV Import simulation
  const handleImportSampleCSV = () => {
    const sampleImport = [
      { name: "Speranza Waragi 750ml", category: "Alcohol & Beer", buyPrice: 2200, sellPrice: 3000, quantity: 20, minStock: 5 },
      { name: "Afia Apple Drink 500ml", category: "Beverages", buyPrice: 700, sellPrice: 1000, quantity: 24, minStock: 6 },
      { name: "Gorilla Coffee Beans 500g", category: "Beverages", buyPrice: 5500, sellPrice: 7500, quantity: 12, minStock: 3 },
    ];
    const res = importProducts(sampleImport);
    if (res.success) {
      toast.success(`Imported ${res.count} new products from CSV`);
    }
  };

  if (!hasPermission("Manager")) {
    return (
      <AdminLayout>
        <div className="p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1F2937]">Access Denied</h3>
          <p className="text-xs text-muted-foreground">
            Stock management and product catalogue edits require Manager or Admin permissions.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#15803D]" />
              Stock & Products Management
            </h2>
            <p className="text-xs text-muted-foreground">
              Maintain product catalog, pricing in Rwf, physical inventory count, and damage corrections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 border-emerald-300 text-[#166534] hover:bg-[#DCFCE7]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportSampleCSV}
              className="gap-1.5 border-border hover:bg-gray-100 text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              Import CSV
            </Button>
          </div>
        </div>

        {/* 2-Column: Left Product List, Right Product Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Table & Filters (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Filter Bar */}
            <Card className="p-3.5 border-border bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9 h-8 text-xs"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                <button
                  onClick={() => setStockFilter("all")}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded font-semibold transition-colors",
                    stockFilter === "all" ? "bg-white text-[#166534] shadow-sm" : "text-muted-foreground"
                  )}
                >
                  All ({activeProducts.length})
                </button>
                <button
                  onClick={() => setStockFilter("low")}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded font-semibold transition-colors",
                    stockFilter === "low" ? "bg-amber-100 text-amber-900 shadow-sm" : "text-amber-700 hover:text-black"
                  )}
                >
                  Low Stock
                </button>
                <button
                  onClick={() => setStockFilter("out")}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded font-semibold transition-colors",
                    stockFilter === "out" ? "bg-red-100 text-[#DC2626] shadow-sm" : "text-red-700 hover:text-black"
                  )}
                >
                  Out of Stock
                </button>
              </div>
            </Card>

            {/* Products Table */}
            <Card className="border-border overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DCFCE7] text-[#166534] font-bold sticky top-0 z-10 border-b border-emerald-200">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Cost (Rwf)</th>
                      <th className="py-2.5 px-3 text-right">Sell (Rwf)</th>
                      <th className="py-2.5 px-3 text-right">Stock</th>
                      <th className="py-2.5 px-3 text-center">Correct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          No products matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = selectedProductId === p.id;
                        const isLow = p.quantity <= p.minStock && p.quantity > 0;
                        const isOut = p.quantity === 0;

                        return (
                          <tr
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected
                                ? "bg-[#DCFCE7]/80 font-semibold"
                                : isOut
                                ? "bg-red-50/60 hover:bg-red-100/60"
                                : isLow
                                ? "bg-amber-50/70 hover:bg-amber-100/70"
                                : "hover:bg-[#DCFCE7]/30"
                            )}
                          >
                            <td className="py-2.5 px-3 font-semibold text-[#1F2937]">
                              {p.name}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground">{p.category}</td>
                            <td className="py-2.5 px-3 text-right text-muted-foreground">
                              {p.buyPrice.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#15803D]">
                              {p.sellPrice.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded",
                                  isOut
                                    ? "bg-red-100 text-[#DC2626]"
                                    : isLow
                                    ? "bg-amber-100 text-[#F59E0B]"
                                    : "text-[#166534]"
                                )}
                              >
                                {p.quantity}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCorrection(p);
                                }}
                                className="h-6 px-1.5 text-[11px] text-[#15803D] hover:bg-[#DCFCE7]"
                                title="Stock correction for damage/loss"
                              >
                                <PenTool className="w-3 h-3 mr-1" />
                                Correct
                              </Button>
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

          {/* Right Column: Product CRUD Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 border-border bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-[#1F2937]">
                  {selectedProductId ? "Edit Product Details" : "Create New Product"}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                  {selectedProductId || "NEW"}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Product Name *</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Inyange Fresh Milk 500ml"
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Category</Label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#15803D]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">Buy Cost (Rwf) *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formBuyPrice}
                      onChange={(e) => setFormBuyPrice(parseInt(e.target.value) || "")}
                      placeholder="e.g. 550"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-[#15803D]">Sell Price (Rwf) *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formSellPrice}
                      onChange={(e) => setFormSellPrice(parseInt(e.target.value) || "")}
                      placeholder="e.g. 700"
                      className="mt-1 h-9 text-xs font-bold text-[#15803D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">Current Stock Units</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                      placeholder="e.g. 24"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-amber-700">Minimum Stock Threshold</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formMinStock}
                      onChange={(e) => setFormMinStock(parseInt(e.target.value) || 0)}
                      placeholder="e.g. 5"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 5 Required Form Buttons: New, Save, Update, Refresh, Delete */}
              <div className="pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-2">
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

                {/* 2 & 3. Save / Update */}
                <Button
                  size="sm"
                  onClick={handleSaveOrUpdate}
                  className="gap-1 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {selectedProductId ? "Update" : "Save"}
                </Button>

                {/* 4. Refresh */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedProductId) {
                      const prod = products.find((p) => p.id === selectedProductId);
                      if (prod) handleSelectProduct(prod);
                    } else {
                      handleNew();
                    }
                    toast.info("Form values refreshed");
                  }}
                  className="gap-1 border-border text-xs"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Refresh
                </Button>

                {/* 5. Delete (archive if has history) */}
                {selectedProductId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="col-span-2 sm:col-span-3 gap-1 border-red-300 text-[#DC2626] hover:bg-red-50 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete / Archive Product
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Stock Correction Modal */}
        {correctionProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-emerald-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Stock Correction: {correctionProduct.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Current recorded stock: <strong>{correctionProduct.quantity} units</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">New Physical Stock Count *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={correctionNewQty}
                    onChange={(e) => setCorrectionNewQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="mt-1 h-9 text-xs font-bold text-[#15803D]"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Difference:{" "}
                    <strong>
                      {correctionNewQty - correctionProduct.quantity > 0 ? "+" : ""}
                      {correctionNewQty - correctionProduct.quantity} units
                    </strong>
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">
                    Mandatory Correction Reason *
                  </Label>
                  <Input
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="e.g. 2 bottles broken during unloading, physical count mismatch"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setCorrectionProduct(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  disabled={!correctionReason.trim()}
                  onClick={handleSaveCorrection}
                  className="flex-1 bg-[#15803D] hover:bg-[#166534] text-white font-bold"
                >
                  Save Correction
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
