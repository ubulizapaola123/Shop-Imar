"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint, CartItem } from "@/lib/sellpoint-store";
import { Product, Sale } from "@/types/sellpoint";
import {
  ShoppingCart,
  Search,
  Plus,
  Trash2,
  Printer,
  FileDown,
  RotateCcw,
  X,
  CheckCircle2,
  Lock,
  Unlock,
  Minus,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const categoryImages: Record<string, string> = {
  "Alcohol & Beer": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=160&q=80",
  Beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=160&q=80",
  Dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&q=80",
  Groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=160&q=80",
  Hygiene: "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=160&q=80",
  Cleaning: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=160&q=80",
};

function ProductImage({ product }: { product: Product }) {
  return (
    <img
      src={categoryImages[product.category] || categoryImages.Groceries}
      alt=""
      className="h-10 w-8 shrink-0 rounded-md border border-slate-100 bg-slate-50 object-cover"
    />
  );
}

export default function SellPage() {
  const router = useRouter();
  const { products, processSale, currentUser, settings, hasPermission } = useSellPoint();

  const todayStr = new Date().toISOString().split("T")[0];

  // Form State
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [allowPriceModify, setAllowPriceModify] = useState(false);
  const [customPrice, setCustomPrice] = useState<number | "">("");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Client and Payment state
  const [clientName, setClientName] = useState("");
  const [isUnknownClient, setIsUnknownClient] = useState(false);
  const [saleDate, setSaleDate] = useState(todayStr);
  const [noCredit, setNoCredit] = useState(true);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("in-stock");

  // Completed sale modal for thermal print / PDF
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId && !p.archived);

  // Filtered products for live search
  const categories = Array.from(new Set(products.filter((p) => !p.archived).map((p) => p.category))).sort();
  const filteredProducts = products
    .filter((p) => !p.archived)
    .filter((p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
    )
    .filter((p) => selectedCategory === "all" || p.category === selectedCategory)
    .filter((p) => {
      if (stockStatus === "all") return true;
      if (stockStatus === "low-stock") return p.quantity > 0 && p.quantity <= p.minStock;
      if (stockStatus === "out-of-stock") return p.quantity <= 0;
      return p.quantity > 0;
    });

  const cartTotal = cart.reduce((acc, item) => acc + item.sellPrice * item.quantity, 0);

  const addProductToCart = (productId: string) => {
    const product = products.find((item) => item.id === productId && !item.archived);
    if (!product) return;
    const inCart = cart.find((item) => item.productId === product.id);
    if (!settings.allowNegativeStock && (inCart?.quantity || 0) >= product.quantity) {
      toast.error(`${product.name} has reached its available stock limit`);
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      return existing
        ? current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { productId: product.id, name: product.name, stock: product.quantity, sellPrice: product.sellPrice, costPrice: product.buyPrice, quantity: 1, customPriceAllowed: false }];
    });
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }

    if (selectedQty <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    // Check against existing in cart
    const inCart = cart.find((it) => it.productId === selectedProduct.id);
    const totalRequested = (inCart ? inCart.quantity : 0) + selectedQty;

    if (!settings.allowNegativeStock && totalRequested > selectedProduct.quantity) {
      toast.error(
        `Quantity cannot exceed available stock (${selectedProduct.quantity} units in stock)`
      );
      return;
    }

    const price = allowPriceModify && typeof customPrice === "number" && customPrice > 0
      ? customPrice
      : selectedProduct.sellPrice;

    if (inCart) {
      setCart((prev) =>
        prev.map((it) =>
          it.productId === selectedProduct.id
            ? { ...it, quantity: it.quantity + selectedQty, sellPrice: price }
            : it
        )
      );
    } else {
      const newItem: CartItem = {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        stock: selectedProduct.quantity,
        sellPrice: price,
        costPrice: selectedProduct.buyPrice,
        quantity: selectedQty,
        customPriceAllowed: allowPriceModify,
      };
      setCart((prev) => [...prev, newItem]);
    }

    toast.success(`Added ${selectedQty}x ${selectedProduct.name} to cart`);
    // Reset selection inputs
    setSelectedQty(1);
    setAllowPriceModify(false);
    setCustomPrice("");
  };

  // Modify cart quantity
  const handleUpdateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const prod = products.find((p) => p.id === productId);
    if (prod && !settings.allowNegativeStock && newQty > prod.quantity) {
      toast.error(`Cannot exceed current stock (${prod.quantity} units)`);
      return;
    }
    setCart((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, quantity: newQty } : it))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((it) => it.productId !== productId));
  };

  // Clear / Restart form
  const handleRestart = () => {
    if (cart.length > 0 && !window.confirm("Are you sure you want to clear the cart and restart?")) {
      return;
    }
    setCart([]);
    setClientName("");
    setIsUnknownClient(false);
    setNoCredit(true);
    setCreditAmount(0);
    setSelectedProductId("");
    setSelectedQty(1);
    toast.info("Sales form cleared");
  };

  // Cancel / Close page
  const handleCancel = () => {
    if (cart.length > 0) {
      if (!window.confirm("You have items in the cart! Are you sure you want to cancel and leave?")) {
        return;
      }
    }
    router.push("/");
  };

  // Execute Sale
  const handleProcessSale = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const effectiveClientName = isUnknownClient ? "Unknown Client" : clientName.trim();
    if (!effectiveClientName) {
      toast.error("Please enter a client name or select 'Unknown Client'");
      return;
    }

    const effectiveCredit = noCredit ? 0 : creditAmount;
    if (effectiveCredit > cartTotal) {
      toast.error("Credit amount cannot exceed total sale amount");
      return;
    }

    if (effectiveCredit > 0 && isUnknownClient) {
      toast.error("Credit sales require an identified client name (cannot be Unknown Client)");
      return;
    }

    const result = processSale({
      clientName: effectiveClientName,
      items: cart,
      creditAmount: effectiveCredit,
      date: saleDate,
    });

    if (result.success && result.sale) {
      toast.success("Saved successfully");
      setCompletedSale(result.sale);
      setCart([]);
      setClientName("");
      setIsUnknownClient(false);
      setNoCredit(true);
      setCreditAmount(0);
    } else {
      toast.error(result.error || "Failed to process sale");
    }
  };

  // Thermal Print Bill
  const handlePrintBill = () => {
    window.print();
  };

  // Save as PDF
  const handleSavePdf = () => {
    toast.info("Preparing PDF bill download...");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1600px] space-y-4 p-5 md:p-6">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-border pb-3 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-[#1F2937]">Sell</h2>
            <p className="text-xs text-muted-foreground">
              Add products to cart, manage items and complete the sale.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
            {[["1", "Products"], ["2", "Cart"], ["3", "Payment"], ["4", "Complete"]].map(([number, label], index) => <React.Fragment key={number}><div className={cn("flex items-center gap-1.5", index === 0 && "text-[#15803D]")}><span className={cn("grid h-5 w-5 place-items-center rounded-full border", index === 0 ? "border-[#15803D] bg-[#15803D] text-white" : "border-border")}>{number}</span>{label}</div>{index < 3 && <span className="h-px w-5 bg-border" />}</React.Fragment>)}
          </div>
        </div>

        {/* 2-Column POS Layout: Left is Product Selection, Right is Cart & Billing */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* Left Column: Product Search & Selection (7 cols) */}
          <div className="space-y-4 xl:col-span-8">
            {/* Live Search & Selector */}
            <Card className="border-border bg-white p-3">
              <div className="mb-3 flex flex-wrap gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search product name, category..."
                  className="h-9 border-border bg-muted/20 pl-9 text-xs focus-visible:ring-1 focus-visible:ring-[#15803D]"
                />
              </div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} aria-label="Filter products by category" className="h-9 min-w-36 rounded-md border border-border bg-white px-3 text-xs text-muted-foreground">
                <option value="all">All Categories</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} aria-label="Filter products by stock status" className="h-9 min-w-28 rounded-md border border-border bg-white px-3 text-xs text-muted-foreground">
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              </div>

              {/* Product Cards Grid / Scroll list */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 max-h-[500px] overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-xs text-muted-foreground">
                    No products match &ldquo;{productSearch}&rdquo;
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedProductId === p.id;
                    const isOut = p.quantity <= 0;
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "rounded-lg border p-3 text-left transition-all duration-150",
                          isSelected
                            ? "border-[#15803D] bg-[#DCFCE7]/60 ring-1 ring-[#15803D]"
                            : isOut
                            ? "border-red-200 bg-red-50/40 opacity-70 cursor-not-allowed"
                          : "border-border hover:border-emerald-300 hover:bg-[#DCFCE7]/20"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <ProductImage product={p} />
                          <span className="min-w-0 flex-1 font-bold text-xs text-[#1F2937] line-clamp-2">
                            {p.name}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                              isOut
                                ? "bg-red-100 text-[#DC2626]"
                                : p.quantity <= p.minStock
                                ? "bg-amber-100 text-[#F59E0B]"
                                : "bg-[#DCFCE7] text-[#166534]"
                            )}
                          >
                            Stock: {p.quantity}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground text-[11px]">{p.category}</span>
                          <span className="font-extrabold text-[#15803D]">
                            {p.sellPrice.toLocaleString()} Rwf
                          </span>
                        </div>
                        <Button disabled={isOut && !settings.allowNegativeStock} onClick={() => addProductToCart(p.id)} size="sm" className="mt-3 h-7 w-full gap-1 bg-[#15803D] text-[11px] hover:bg-[#166534]"><ShoppingCart className="h-3 w-3" /> Add</Button>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Product Configuration Box */}
            {false && selectedProduct && (
              <Card className="p-4 border-emerald-300 bg-[#DCFCE7]/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#166534]">{selectedProduct.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Category: {selectedProduct.category} • Cost: {selectedProduct.buyPrice.toLocaleString()} Rwf •
                      Stock Available: <strong className="text-[#166534]">{selectedProduct.quantity}</strong>
                    </p>
                  </div>
                  <span className="text-base font-black text-[#15803D]">
                    Standard: {selectedProduct.sellPrice.toLocaleString()} Rwf
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  {/* Quantity input */}
                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">Quantity to Sell</Label>
                    <Input
                      type="number"
                      min={1}
                      max={settings.allowNegativeStock ? 9999 : selectedProduct.quantity}
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="mt-1 h-9 bg-white"
                    />
                  </div>

                  {/* Modify Price Checkbox & Field */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="modify-price"
                        checked={allowPriceModify}
                        onCheckedChange={(val) => {
                          if (val && !hasPermission("Manager")) {
                            toast.error("Manager or Admin permission required for price override");
                            return;
                          }
                          setAllowPriceModify(!!val);
                          if (val && customPrice === "") {
                            setCustomPrice(selectedProduct.sellPrice);
                          }
                        }}
                      />
                      <label
                        htmlFor="modify-price"
                        className="text-xs font-semibold text-[#1F2937] flex items-center gap-1 cursor-pointer select-none"
                      >
                        {allowPriceModify ? <Unlock className="w-3.5 h-3.5 text-[#15803D]" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                        Modify one-off price (Permission required)
                      </label>
                    </div>

                    {allowPriceModify && (
                      <Input
                        type="number"
                        placeholder="Custom selling price (Rwf)"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(parseInt(e.target.value) || "")}
                        className="h-9 bg-white text-xs"
                      />
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold h-10 gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add to Cart (Subtotal: {((allowPriceModify && typeof customPrice === "number" ? Number(customPrice) : selectedProduct.sellPrice) * selectedQty).toLocaleString()} Rwf)
                </Button>
              </Card>
            )}
          </div>

          {/* Right Column: Cart & Billing Form (5 cols) */}
          <div className="space-y-4 xl:col-span-4">
            {/* Cart Table */}
            <Card className="flex flex-col justify-between border-border bg-white p-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#15803D]" />
                  <h3 className="text-sm font-bold text-[#1F2937]">Current Sale Cart</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] font-bold">
                  {cart.length} {cart.length === 1 ? "Line" : "Lines"}
                </span>
              </div>

              {/* Cart List */}
              <div className="min-h-[260px] max-h-[430px] divide-y divide-border overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="py-10 text-center text-xs text-muted-foreground">
                    <p>Your cart is empty.</p>
                    <p className="mt-1">Select products on the left to add items.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#1F2937] truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.sellPrice.toLocaleString()} Rwf &times; {item.quantity} ={" "}
                          <strong className="text-[#166534]">
                            {(item.sellPrice * item.quantity).toLocaleString()} Rwf
                          </strong>
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex shrink-0 items-center gap-1.5">
                        <div className="flex items-center rounded-md border border-border"><button type="button" onClick={() => handleUpdateCartQty(item.productId, item.quantity - 1)} className="p-1.5 hover:bg-gray-50"><Minus className="h-3 w-3" /></button><span className="w-6 text-center text-xs font-semibold">{item.quantity}</span><button type="button" onClick={() => handleUpdateCartQty(item.productId, item.quantity + 1)} className="p-1.5 hover:bg-[#DCFCE7]"><Plus className="h-3 w-3" /></button></div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCartItem(item.productId)}
                          className="h-7 w-7 text-muted-foreground hover:text-[#DC2626] hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Total Display */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  Total Payable:
                </span>
                <span className="text-xl font-black text-[#15803D]">
                  {cartTotal.toLocaleString()} Rwf
                </span>
              </div>
            </Card>

            {false && <Card className="p-4 border-border bg-white space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Client & Payment Options
              </Label>

              {/* Client Name Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#1F2937]">Client Name</Label>
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id="unknown-client"
                      checked={isUnknownClient}
                      onCheckedChange={(val) => {
                        setIsUnknownClient(!!val);
                        if (val) {
                          setClientName("Unknown Client");
                          setNoCredit(true); // Unknown clients cannot take credit
                          setCreditAmount(0);
                        } else {
                          setClientName("");
                        }
                      }}
                    />
                    <label
                      htmlFor="unknown-client"
                      className="text-xs text-muted-foreground cursor-pointer select-none"
                    >
                      Unknown Client (Default)
                    </label>
                  </div>
                </div>
                <Input
                  disabled={isUnknownClient}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Mugisha Emmanuel"
                  className="h-9 text-xs"
                />
              </div>

              {/* Date picker */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1F2937]">Sale Date</Label>
                <Input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Credit Options */}
              <div className="p-3 rounded-lg border border-border bg-gray-50 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="no-credit"
                    checked={noCredit}
                    onCheckedChange={(val) => {
                      setNoCredit(!!val);
                      if (val) setCreditAmount(0);
                      else setCreditAmount(Math.round(cartTotal * 0.5));
                    }}
                  />
                  <label
                    htmlFor="no-credit"
                    className="text-xs font-bold text-[#1F2937] cursor-pointer select-none"
                  >
                    No credit (Full cash payment)
                  </label>
                </div>

                {!noCredit && (
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs font-semibold text-[#166534]">
                      Credit Debt Amount (Max: {cartTotal.toLocaleString()} Rwf)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={cartTotal}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(Math.min(cartTotal, parseInt(e.target.value) || 0))}
                      placeholder="Credit amount to record"
                      className="h-8 text-xs bg-white"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Cash to receive at counter:{" "}
                      <strong className="text-[#15803D]">
                        {(cartTotal - creditAmount).toLocaleString()} Rwf
                      </strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Sell Button */}
              <Button
                disabled={cart.length === 0}
                onClick={handleProcessSale}
                className={cn(
                  "w-full h-11 text-base font-bold shadow-md transition-all",
                  cart.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#15803D] hover:bg-[#166534] text-white"
                )}
              >
                Complete Sale ({cartTotal.toLocaleString()} Rwf)
              </Button>
            </Card>}
            <div className="border-t border-border pt-3">
              <div className="mb-3 flex items-center justify-between text-xs"><span className="text-muted-foreground">Subtotal</span><strong>{cartTotal.toLocaleString()} Rwf</strong></div>
              <div className="mb-3 flex items-center justify-between text-xs"><span className="text-muted-foreground">Discount</span><Button variant="outline" size="sm" className="h-6 gap-1 border-emerald-200 px-2 text-[10px] text-[#15803D]"><Plus className="h-3 w-3" /> Add Discount</Button></div>
              <div className="mb-4 flex items-center justify-between border-t border-border pt-3"><span className="text-sm font-bold text-[#1F2937]">Total</span><strong className="text-xl text-[#15803D]">{cartTotal.toLocaleString()} Rwf</strong></div>
              <Button disabled={cart.length === 0} onClick={() => setIsPaymentOpen(true)} className="h-10 w-full gap-2 bg-[#15803D] font-bold text-white hover:bg-[#166534]"><CreditCard className="h-4 w-4" /> Continue to Payment <span>→</span></Button>
            </div>
          </div>
        </div>

        {isPaymentOpen && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Customer and payment details">
            <div className="w-full max-w-sm rounded-xl border border-emerald-100 bg-white p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between border-b border-border pb-3"><h3 className="text-xs font-bold text-[#1F2937]">Customer &amp; Payment Details</h3><button type="button" onClick={() => setIsPaymentOpen(false)} className="text-muted-foreground hover:text-[#1F2937]" aria-label="Close payment dialog"><X className="h-4 w-4" /></button></div>
              <div className="space-y-3">
                <div><div className="mb-1 flex items-center justify-between"><Label className="text-[10px] font-semibold">Customer (Optional)</Label><button type="button" onClick={() => { setClientName(""); setIsUnknownClient(false); }} className="text-[10px] font-semibold text-[#15803D]">+ New Customer</button></div><Input value={isUnknownClient ? "Unknown Client" : clientName} onChange={(event) => { setClientName(event.target.value); setIsUnknownClient(false); }} placeholder="Search or add customer..." className="h-8 text-[11px]" /></div>
                <div><Label className="mb-1.5 block text-[10px] font-semibold">Payment Method</Label><div className="grid grid-cols-4 gap-2"><button type="button" onClick={() => { setNoCredit(true); setCreditAmount(0); }} className={cn("rounded-lg border p-2 text-[9px] font-semibold", noCredit ? "border-[#15803D] bg-[#F0FDF4] text-[#166534]" : "border-border text-muted-foreground")}><CreditCard className="mx-auto mb-1 h-3.5 w-3.5" />Cash</button><button type="button" className="rounded-lg border border-border p-2 text-[9px] text-muted-foreground"><CreditCard className="mx-auto mb-1 h-3.5 w-3.5" />Mobile Money</button><button type="button" className="rounded-lg border border-border p-2 text-[9px] text-muted-foreground"><CreditCard className="mx-auto mb-1 h-3.5 w-3.5" />Card</button><button type="button" onClick={() => { setNoCredit(false); setCreditAmount(cartTotal); }} className={cn("rounded-lg border p-2 text-[9px] font-semibold", !noCredit ? "border-[#15803D] bg-[#F0FDF4] text-[#166534]" : "border-border text-muted-foreground")}><CreditCard className="mx-auto mb-1 h-3.5 w-3.5" />Credit</button></div></div>
                {!noCredit && <div><Label className="mb-1 block text-[10px] font-semibold">Credit amount</Label><Input type="number" min={0} max={cartTotal} value={creditAmount} onChange={(event) => setCreditAmount(Math.min(cartTotal, Number(event.target.value) || 0))} className="h-8 text-xs" /></div>}
                <div><Label className="mb-1 block text-[10px] font-semibold">Amount Received</Label><div className="relative"><Input value={(cartTotal - (noCredit ? 0 : creditAmount)).toLocaleString()} readOnly className="h-8 pr-9 text-xs" /><span className="absolute right-3 top-2 text-[10px] text-muted-foreground">Rwf</span></div></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Change</span><strong className="text-[#15803D]">0 Rwf</strong></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)}>Cancel</Button><Button size="sm" onClick={() => { setIsPaymentOpen(false); handleProcessSale(); }} className="gap-1.5 bg-[#15803D] text-white hover:bg-[#166534]"><CheckCircle2 className="h-3.5 w-3.5" /> Confirm Payment</Button></div>
            </div>
          </div>, document.body
        )}

        {/* Modal for Bill Printing / PDF after successful sale */}
        {completedSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-emerald-300">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2937]">Saved successfully!</h3>
                <p className="text-xs text-muted-foreground">
                  Ticket #{completedSale.saleNumber} has been logged and stock deducted.
                </p>
              </div>

              {/* Printable Receipt Preview */}
              <div
                id="printable-receipt"
                className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-xs font-mono space-y-2"
              >
                <div className="text-center border-b border-gray-300 pb-2">
                  <p className="font-bold text-sm">{settings.shopName}</p>
                  <p className="text-[10px]">{settings.address}</p>
                  <p className="text-[10px]">TIN: {settings.tin} • Tel: {settings.phone}</p>
                  <p className="text-[10px] mt-1">Ticket: {completedSale.saleNumber}</p>
                  <p className="text-[10px]">Date: {completedSale.date} | Op: {completedSale.operatorName}</p>
                </div>

                <div className="divide-y divide-gray-200 py-1 text-[11px]">
                  {completedSale.lines.map((ln) => (
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
                    <span>{completedSale.total.toLocaleString()} Rwf</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Paid:</span>
                    <span>{completedSale.paidAmount.toLocaleString()} Rwf</span>
                  </div>
                  {completedSale.creditAmount > 0 && (
                    <div className="flex justify-between text-[#DC2626] font-bold">
                      <span>Credit Debt:</span>
                      <span>{completedSale.creditAmount.toLocaleString()} Rwf</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span>{completedSale.clientName}</span>
                  </div>
                </div>

                <div className="text-center border-t border-gray-300 pt-2 text-[10px] text-muted-foreground">
                  <p>{settings.receiptFooter}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={handlePrintBill}
                  className="gap-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold"
                >
                  <Printer className="w-4 h-4" />
                  Print Bill (POS)
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSavePdf}
                  className="gap-2 border-emerald-300 text-[#166534] hover:bg-[#DCFCE7]"
                >
                  <FileDown className="w-4 h-4" />
                  Save as PDF
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setCompletedSale(null)}
                className="w-full text-xs text-muted-foreground hover:bg-gray-100"
              >
                Close and Start Next Sale
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
