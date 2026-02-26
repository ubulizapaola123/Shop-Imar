"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Minus, Plus, X, ArrowRight, ShoppingCart as CartIcon, Tag,
    CreditCard, Smartphone, Wallet, CheckCircle2, Package,
    MapPin, User, Phone, ChevronRight, Truck, Lock, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────
interface CartItem {
    id: number; name: string; price: number; quantity: number;
    image: string; category: string; sku: string;
}

type PayMethod = "MTN MoMo" | "Mastercard" | "Visa" | "Airtel Money" | "Cash";
type CheckoutStep = "cart" | "shipping" | "payment" | "confirm";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const initialItems: CartItem[] = [
    { id: 1, name: "Inyange Whole Milk 500ml", price: 600, quantity: 4, image: "/placeholder.svg", category: "Dairy", sku: "SKU-001" },
    { id: 2, name: "Bakers Choice Sliced Bread", price: 1_000, quantity: 2, image: "/placeholder.svg", category: "Bakery", sku: "SKU-002" },
    { id: 3, name: "Hillside Fresh Eggs (12pk)", price: 2_500, quantity: 1, image: "/placeholder.svg", category: "Poultry", sku: "SKU-003" },
    { id: 4, name: "Simba Roasted Coffee 250g", price: 4_500, quantity: 2, image: "/placeholder.svg", category: "Beverages", sku: "SKU-004" },
];

const recommended = [
    { id: 10, name: "Inyange Passion Fruit", category: "Drink", price: 1_200, oldPrice: 1_500 },
    { id: 11, name: "Skol Lager 330ml", category: "Beverage", price: 1_000, oldPrice: 1_200 },
    { id: 12, name: "Simba Salt 1kg", category: "Pantry", price: 800, oldPrice: 1_000 },
    { id: 13, name: "Akabanga Hot Oil", category: "Spice", price: 1_500, oldPrice: 2_000 },
];

const fmtRWF = (n: number) => n.toLocaleString("en-RW") + " RWF";

// ─── Step Indicator ─────────────────────────────────────────────────────────
const steps: { key: CheckoutStep; label: string }[] = [
    { key: "cart", label: "Cart" },
    { key: "shipping", label: "Shipping" },
    { key: "payment", label: "Payment" },
    { key: "confirm", label: "Confirm" },
];

function StepIndicator({ current }: { current: CheckoutStep }) {
    const idx = steps.findIndex((s) => s.key === current);
    return (
        <div className="flex items-center gap-0">
            {steps.map((s, i) => (
                <div key={s.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                                i < idx
                                    ? "bg-[#FF6600] border-[#FF6600] text-white"
                                    : i === idx
                                        ? "bg-white border-[#FF6600] text-[#FF6600]"
                                        : "bg-white border-border text-muted-foreground"
                            )}
                        >
                            {i < idx ? <CheckCircle2 size={16} /> : i + 1}
                        </div>
                        <p
                            className={cn(
                                "text-[10px] mt-1 font-semibold",
                                i <= idx ? "text-[#FF6600]" : "text-muted-foreground"
                            )}
                        >
                            {s.label}
                        </p>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            className={cn("h-0.5 w-16 mb-5 mx-1 transition-all", i < idx ? "bg-[#FF6600]" : "bg-border")}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>(initialItems);
    const [coupon, setCoupon] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [step, setStep] = useState<CheckoutStep>("cart");
    const [payMethod, setPayMethod] = useState<PayMethod>("MTN MoMo");
    const [momoNumber, setMomoNumber] = useState("");
    const [shipping, setShipping] = useState({ name: "", phone: "", address: "", branch: "" });
    const [orderPlaced, setOrderPlaced] = useState(false);

    const updateQty = (id: number, delta: number) =>
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
        );
    const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const discount = appliedCoupon ? Math.floor(subtotal * 0.1) : 0;
    const delivery = 5_000;
    const total = subtotal - discount + delivery;

    const applyCoupon = () => {
        if (coupon.toUpperCase() === "SIMBA10") setAppliedCoupon("SIMBA10");
    };

    const placeOrder = () => {
        setOrderPlaced(true);
        setStep("confirm");
    };

    // ── Order Placed ───────────────────────────────────────────────────────
    if (orderPlaced) {
        return (
            <AdminLayout>
                <div className="p-8 flex items-center justify-center min-h-[70vh]">
                    <div className="text-center max-w-md space-y-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold">Order Confirmed!</h2>
                            <p className="text-muted-foreground mt-2">
                                Your order has been placed successfully. Branch delivery estimated in 24–48 hours.
                            </p>
                        </div>
                        <div className="bg-muted/40 rounded-2xl p-5 text-left space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Order ID</span>
                                <span className="font-bold font-mono text-[#FF6600]">ORD-{Date.now().toString().slice(-6)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Paid</span>
                                <span className="font-bold">{fmtRWF(total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment</span>
                                <span className="font-medium">{payMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery to</span>
                                <span className="font-medium">{shipping.branch || "Main Branch"}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => { setOrderPlaced(false); setItems(initialItems); setStep("cart"); }}>
                                <RotateCcw size={15} className="mr-2" /> New Order
                            </Button>
                            <Button className="flex-1 bg-[#FF6600] hover:bg-[#E65C00] text-white" onClick={() => window.location.href = "/orders"}>
                                <Package size={15} className="mr-2" /> Track Order
                            </Button>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-8 space-y-8 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold flex items-center gap-3">
                            <CartIcon className="w-8 h-8 text-[#FF6600]" /> Cart & Checkout
                        </h1>
                        <p className="text-muted-foreground mt-1">Review items, set shipping details, and place your order.</p>
                    </div>
                    <StepIndicator current={step} />
                </div>

                {/* ── STEP: CART ─────────────────────────────────────────────── */}
                {step === "cart" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="rounded-2xl border border-border overflow-hidden bg-white shadow-sm">
                                <div className="bg-gradient-to-r from-[#FF6600] to-orange-500 text-white px-6 py-4 flex items-center justify-between">
                                    <h2 className="font-bold flex items-center gap-2"><CartIcon size={18} /> Order Items ({items.length})</h2>
                                    <span className="text-sm opacity-80">{items.reduce((a, i) => a + i.quantity, 0)} units</span>
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
                                            <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Unit Price</th>
                                            <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Quantity</th>
                                            <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                                                            <X size={14} />
                                                        </button>
                                                        <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden border border-border flex items-center justify-center">
                                                            <Package size={20} className="text-muted-foreground/50" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{item.name}</p>
                                                            <p className="text-xs text-muted-foreground">{item.category} · {item.sku}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-muted-foreground">{fmtRWF(item.price)}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center border border-border rounded-xl w-fit overflow-hidden">
                                                        <button onClick={() => updateQty(item.id, -1)} className="p-2 hover:bg-muted transition-colors">
                                                            <Minus size={13} />
                                                        </button>
                                                        <span className="px-4 font-bold text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQty(item.id, 1)} className="p-2 hover:bg-muted transition-colors">
                                                            <Plus size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-bold text-foreground">{fmtRWF(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Coupon */}
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter coupon code (try SIMBA10)"
                                        value={coupon}
                                        onChange={(e) => setCoupon(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={applyCoupon}
                                    disabled={!!appliedCoupon}
                                    className="border-[#FF6600] text-[#FF6600] hover:bg-orange-50"
                                >
                                    {appliedCoupon ? "Applied ✓" : "Apply"}
                                </Button>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-4">
                            <Card className="p-0 overflow-hidden border border-border shadow-sm">
                                <div className="bg-gradient-to-r from-[#FF6600] to-orange-500 text-white px-5 py-4">
                                    <h3 className="font-bold">Order Summary</h3>
                                </div>
                                <div className="p-5 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                                        <span className="font-semibold">{fmtRWF(subtotal)}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-green-700">
                                            <span>Coupon ({appliedCoupon})</span>
                                            <span>−{fmtRWF(discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1"><Truck size={13} /> Delivery</span>
                                        <span className="font-semibold">{fmtRWF(delivery)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base border-t border-border pt-3 mt-2">
                                        <span>Total</span>
                                        <span className="text-[#FF6600]">{fmtRWF(total)}</span>
                                    </div>
                                    <Button
                                        className="w-full bg-[#FF6600] hover:bg-[#E65C00] text-white py-5 mt-2 rounded-xl font-bold shadow-md shadow-orange-100"
                                        onClick={() => setStep("shipping")}
                                        disabled={items.length === 0}
                                    >
                                        Proceed to Shipping <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </Card>

                            {/* Badges */}
                            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2"><Lock size={12} className="text-green-600" /> Secure SSL-encrypted checkout</div>
                                <div className="flex items-center gap-2"><Truck size={12} className="text-blue-500" /> Free delivery above 500,000 RWF</div>
                                <div className="flex items-center gap-2"><RotateCcw size={12} className="text-orange-500" /> 7-day return policy</div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="lg:col-span-full space-y-5 pt-4 border-t border-border">
                            <h2 className="text-xl font-bold">You May Also Need</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                {recommended.map((p) => (
                                    <div key={p.id} className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
                                        <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
                                            <span className="absolute top-2 left-2 bg-[#FF6600] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                                            </span>
                                            <Package size={40} className="text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <div className="p-3 space-y-1">
                                            <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">{p.category}</p>
                                            <h4 className="font-semibold text-sm leading-tight">{p.name}</h4>
                                            <div className="flex items-center justify-between pt-1">
                                                <div>
                                                    <span className="font-bold text-sm text-[#FF6600]">{p.price.toLocaleString()} RWF</span>
                                                    <span className="text-muted-foreground text-xs line-through ml-1">{p.oldPrice.toLocaleString()}</span>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setItems((prev) => {
                                                            const ex = prev.find((i) => i.id === p.id);
                                                            if (ex) return prev.map((i) => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
                                                            return [...prev, { id: p.id, name: p.name, price: p.price, quantity: 1, image: "/placeholder.svg", category: p.category, sku: `SKU-R${p.id}` }];
                                                        })
                                                    }
                                                    className="w-7 h-7 rounded-full border border-[#FF6600] text-[#FF6600] flex items-center justify-center hover:bg-[#FF6600] hover:text-white transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STEP: SHIPPING ─────────────────────────────────────────── */}
                {step === "shipping" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-[#FF6600]" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg">Shipping Details</h2>
                                        <p className="text-sm text-muted-foreground">Where should we deliver this order?</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><User size={11} /> Recipient Name</Label>
                                        <Input placeholder="Full name" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Phone size={11} /> Phone</Label>
                                        <Input placeholder="0788 000 111" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><MapPin size={11} /> Delivery Address</Label>
                                        <Input placeholder="Street, Sector, District" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Destination Branch</Label>
                                        <select
                                            value={shipping.branch}
                                            onChange={(e) => setShipping({ ...shipping, branch: e.target.value })}
                                            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                        >
                                            <option value="">Select branch…</option>
                                            {["Kicukiro", "Remera", "Nyamirambo", "Gisozi", "Nyabugogo", "Headquarters"].map((b) => (
                                                <option key={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setStep("cart")}>← Back to Cart</Button>
                                <Button
                                    className="flex-1 bg-[#FF6600] hover:bg-[#E65C00] text-white"
                                    onClick={() => setStep("payment")}
                                    disabled={!shipping.name || !shipping.branch}
                                >
                                    Continue to Payment <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        </div>

                        {/* Mini summary */}
                        <MiniSummary total={total} items={items.length} />
                    </div>
                )}

                {/* ── STEP: PAYMENT ──────────────────────────────────────────── */}
                {step === "payment" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-[#FF6600]" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg">Payment Method</h2>
                                        <p className="text-sm text-muted-foreground">Select how you'd like to pay.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {(["MTN MoMo", "Mastercard", "Visa", "Airtel Money", "Cash"] as PayMethod[]).map((m) => {
                                        const icons: Record<PayMethod, React.ElementType> = {
                                            "MTN MoMo": Smartphone, Mastercard: CreditCard, Visa: CreditCard,
                                            "Airtel Money": Smartphone, Cash: Wallet,
                                        };
                                        const colors: Record<PayMethod, string> = {
                                            "MTN MoMo": "bg-yellow-400", Mastercard: "bg-red-600",
                                            Visa: "bg-blue-600", "Airtel Money": "bg-red-500", Cash: "bg-green-600",
                                        };
                                        const Icon = icons[m];
                                        return (
                                            <button
                                                key={m}
                                                onClick={() => setPayMethod(m)}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                                                    payMethod === m ? "border-[#FF6600] bg-orange-50" : "border-border bg-white hover:border-orange-300"
                                                )}
                                            >
                                                <div className={cn("w-10 h-8 rounded-md flex items-center justify-center", colors[m])}>
                                                    <Icon size={18} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm">{m}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {m === "MTN MoMo" ? "0788 111 222" : m === "Airtel Money" ? "0733 444 555" : m === "Cash" ? "Pay at delivery" : "Saved card"}
                                                    </p>
                                                </div>
                                                <div className={cn("w-4 h-4 rounded-full border-2 transition-all", payMethod === m ? "border-[#FF6600] bg-[#FF6600]" : "border-border")} />
                                            </button>
                                        );
                                    })}
                                </div>

                                {(payMethod === "MTN MoMo" || payMethod === "Airtel Money") && (
                                    <div className="space-y-1 pt-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mobile Number</Label>
                                        <Input
                                            placeholder={payMethod === "MTN MoMo" ? "0788 000 111" : "0733 000 111"}
                                            value={momoNumber}
                                            onChange={(e) => setMomoNumber(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">You will receive a payment prompt on this number.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setStep("shipping")}>← Back</Button>
                                <Button
                                    className="flex-1 bg-[#FF6600] hover:bg-[#E65C00] text-white"
                                    onClick={placeOrder}
                                >
                                    <Lock size={15} className="mr-2" /> Place Order · {fmtRWF(total)}
                                </Button>
                            </div>
                        </div>

                        <MiniSummary total={total} items={items.length} />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

// ─── Mini Order Summary Sidebar ─────────────────────────────────────────────
function MiniSummary({ total, items }: { total: number; items: number }) {
    return (
        <Card className="p-5 border border-border shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-sm">Order Summary</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{items} item types</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>5,000 RWF</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-3">
                    <span>Total</span>
                    <span className="text-[#FF6600]">{total.toLocaleString("en-RW")} RWF</span>
                </div>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-2"><Lock size={11} className="text-green-600" /> Secure payment</div>
                <div className="flex items-center gap-2"><Truck size={11} className="text-blue-500" /> 24–48hr delivery</div>
            </div>
        </Card>
    );
}
