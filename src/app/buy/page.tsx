"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint, RestockCartItem } from "@/lib/sellpoint-store";
import { Purchase } from "@/types/sellpoint";
import {
  PackagePlus,
  Search,
  Plus,
  Trash2,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Calendar,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function BuyPage() {
  const { products, purchases, processRestock, cancelRestock, currentUser, hasPermission } =
    useSellPoint();

  const todayStr = new Date().toISOString().split("T")[0];

  // Restock form state
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [restockQty, setRestockQty] = useState<number>(10);
  const [buyPrice, setBuyPrice] = useState<number | "">("");
  const [supplier, setSupplier] = useState("");
  const [restockDate, setRestockDate] = useState(todayStr);

  // Cart
  const [cart, setCart] = useState<RestockCartItem[]>([]);

  // Cancellation modal
  const [purchaseToCancel, setPurchaseToCancel] = useState<Purchase | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const selectedProduct = products.find((p) => p.id === selectedProductId && !p.archived);

  const filteredProducts = products
    .filter((p) => !p.archived)
    .filter((p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
    );

  const cartTotal = cart.reduce((acc, it) => acc + it.buyPrice * it.quantity, 0);

  // When a product is selected, initialize buying price with current cost price
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setBuyPrice(prod.buyPrice);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (restockQty <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    if (typeof buyPrice !== "number" || buyPrice <= 0) {
      toast.error("Valid buying price in Rwf is required");
      return;
    }

    const inCart = cart.find((it) => it.productId === selectedProduct.id);
    if (inCart) {
      setCart((prev) =>
        prev.map((it) =>
          it.productId === selectedProduct.id
            ? { ...it, quantity: it.quantity + restockQty, buyPrice }
            : it
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          currentStock: selectedProduct.quantity,
          quantity: restockQty,
          buyPrice,
        },
      ]);
    }

    toast.success(`Added ${restockQty}x ${selectedProduct.name} to restock cart`);
    setSelectedQty(10);
  };

  const setSelectedQty = (qty: number) => {
    setRestockQty(qty);
  };

  const handleRemoveItem = (prodId: string) => {
    setCart((prev) => prev.filter((it) => it.productId !== prodId));
  };

  // Submit Restock
  const handleSaveRestock = () => {
    if (cart.length === 0) {
      toast.error("Restock cart is empty");
      return;
    }

    const res = processRestock({
      items: cart,
      supplier: supplier.trim() || undefined,
      date: restockDate,
    });

    if (res.success) {
      toast.success("Stock upgraded and saved successfully!");
      setCart([]);
      setSupplier("");
      setSelectedProductId("");
    } else {
      toast.error(res.error || "Failed to save restock");
    }
  };

  // Cancel Restock
  const handleConfirmCancelRestock = () => {
    if (!purchaseToCancel) return;
    if (!cancelReason.trim()) {
      toast.error("Cancellation reason is mandatory");
      return;
    }

    const res = cancelRestock(purchaseToCancel.id, cancelReason.trim());
    if (res.success) {
      toast.success("Restock record cancelled and stock reverted.");
      setPurchaseToCancel(null);
      setCancelReason("");
    } else {
      toast.error(res.error || "Cannot cancel restock");
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
            Restock and supplier buying operations require Manager or Admin permissions.
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
              <PackagePlus className="w-5 h-5 text-[#15803D]" />
              Buy (Restock Inventory)
            </h2>
            <p className="text-xs text-muted-foreground">
              Record new deliveries from suppliers, increase product inventory, and update buying cost prices
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] font-bold border border-emerald-200">
            Manager Stock Control
          </span>
        </div>

        {/* 2-Column Restock Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Search & Restock Line Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="p-4 border-border bg-white space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Select Product to Restock
              </Label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products to restock..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Product selection grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProductId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p.id)}
                      className={cn(
                        "p-3 rounded-xl border text-left cursor-pointer transition-all",
                        isSelected
                          ? "border-[#15803D] bg-[#DCFCE7]/70 ring-1 ring-[#15803D]"
                          : "border-border hover:border-emerald-300 hover:bg-[#DCFCE7]/20"
                      )}
                    >
                      <p className="font-bold text-xs text-[#1F2937] truncate">{p.name}</p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Current Stock: <strong>{p.quantity}</strong></span>
                        <span className="font-semibold text-[#15803D]">
                          Buy: {p.buyPrice.toLocaleString()} Rwf
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Restock Line Settings */}
            {selectedProduct && (
              <Card className="p-4 border-emerald-300 bg-[#DCFCE7]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#166534]">{selectedProduct.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    Current stock: <strong>{selectedProduct.quantity} units</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">Quantity to Add</Label>
                    <Input
                      type="number"
                      min={1}
                      value={restockQty}
                      onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="mt-1 h-9 bg-white text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">
                      Buying Cost Price (Rwf per unit)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(parseInt(e.target.value) || "")}
                      className="mt-1 h-9 bg-white text-xs font-bold text-[#15803D]"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold h-9 gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add to Restock Cart (Subtotal: {((typeof buyPrice === "number" ? buyPrice : 0) * restockQty).toLocaleString()} Rwf)
                </Button>
              </Card>
            )}
          </div>

          {/* Right Column: Restock Cart & Supplier Form (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="p-4 border-border bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-[#1F2937]">Restock Batch Items</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] font-bold">
                  {cart.length} Products
                </span>
              </div>

              {/* Cart List */}
              <div className="divide-y divide-border min-h-[150px] max-h-[220px] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="py-10 text-center text-xs text-muted-foreground">
                    <p>No restock items added yet.</p>
                    <p className="mt-1">Select a product and enter cost &amp; quantity.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1F2937] truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          +{item.quantity} units @ {item.buyPrice.toLocaleString()} Rwf ={" "}
                          <strong className="text-[#15803D]">
                            {(item.quantity * item.buyPrice).toLocaleString()} Rwf
                          </strong>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="h-7 w-7 text-muted-foreground hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  Total Delivery Cost:
                </span>
                <span className="text-xl font-black text-[#15803D]">
                  {cartTotal.toLocaleString()} Rwf
                </span>
              </div>
            </Card>

            {/* Supplier & Date Form */}
            <Card className="p-4 border-border bg-white space-y-3.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Supplier & Restock Date
              </Label>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1F2937]">
                  Supplier Name <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Inyange Industries, Bralirwa Ltd, Azam..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1F2937]">Restock Date</Label>
                <Input
                  type="date"
                  value={restockDate}
                  onChange={(e) => setRestockDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <Button
                disabled={cart.length === 0}
                onClick={handleSaveRestock}
                className={cn(
                  "w-full h-11 text-base font-bold shadow-md transition-all",
                  cart.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#15803D] hover:bg-[#166534] text-white"
                )}
              >
                Upgrade / Save Stock ({cartTotal.toLocaleString()} Rwf)
              </Button>
            </Card>
          </div>
        </div>

        {/* Previous Restock Deliveries & Cancellation Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#15803D]" />
            Previous Restock History
          </h3>

          <Card className="border-border overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DCFCE7] text-[#166534] font-bold border-b border-emerald-200">
                  <tr>
                    <th className="py-2.5 px-3">Batch ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3">Operator</th>
                    <th className="py-2.5 px-3 text-right">Items</th>
                    <th className="py-2.5 px-3 text-right">Cost (Rwf)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No restocks recorded yet.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => {
                      const isCancelled = p.status === "cancelled";
                      return (
                        <tr key={p.id} className={cn("hover:bg-[#DCFCE7]/20", isCancelled && "bg-red-50/40 opacity-70")}>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#15803D]">{p.purchaseNumber}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{p.date}</td>
                          <td className="py-2.5 px-3 font-medium">{p.supplier || "Direct purchase"}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{p.operatorName}</td>
                          <td className="py-2.5 px-3 text-right font-semibold">
                            {p.lines.reduce((acc, l) => acc + l.quantity, 0)} units
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#1F2937]">
                            {p.total.toLocaleString()} Rwf
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isCancelled ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-[#DC2626]">
                                CANCELLED
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">
                                COMPLETED
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {!isCancelled && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPurchaseToCancel(p);
                                  setCancelReason("");
                                }}
                                className="h-7 text-xs text-[#DC2626] hover:bg-red-50 gap-1"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Cancel Restock
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

        {/* Cancel Restock Dialog */}
        {purchaseToCancel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Cancel Restock {purchaseToCancel.purchaseNumber}?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    This will deduct the restocked quantities from current inventory.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <strong>Safety Rule:</strong> Cancellation is blocked automatically if deducting this restock would cause any product stock to drop below zero.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]">
                  Cancellation Reason <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Returned wrong batch to supplier..."
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setPurchaseToCancel(null)} className="flex-1">
                  Keep Restock
                </Button>
                <Button
                  disabled={!cancelReason.trim()}
                  onClick={handleConfirmCancelRestock}
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
