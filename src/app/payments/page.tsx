"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CreditCard, Wallet, Smartphone, TrendingUp, TrendingDown,
    Clock, CheckCircle2, XCircle, Search, Plus, X, Edit2,
    ArrowUpRight, ArrowDownRight, Download, Filter, Eye, EyeOff,
    Shield, Star, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────
type TxStatus = "completed" | "pending" | "failed";
type PayType = "Mastercard" | "Visa" | "MTN MoMo" | "Airtel Money" | "Cash";

interface Transaction {
    id: string; ref: string; amount: number; type: "credit" | "debit";
    status: TxStatus; method: PayType; branch: string; date: string; desc: string;
}

interface PaymentMethod {
    id: number; type: PayType; accountNo: string; name: string;
    cvc: string; expiry: string; isDefault: boolean; balance?: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialMethods: PaymentMethod[] = [
    { id: 1, type: "Mastercard", accountNo: "**** **** **** 2138", name: "Simba Admin", cvc: "258", expiry: "10/26", isDefault: true },
    { id: 2, type: "Visa", accountNo: "**** **** **** 4421", name: "Simba Admin", cvc: "123", expiry: "12/25", isDefault: false },
    { id: 3, type: "MTN MoMo", accountNo: "0788 111 222", name: "Simba Supermarket", cvc: "N/A", expiry: "N/A", isDefault: false, balance: 2_450_000 },
    { id: 4, type: "Airtel Money", accountNo: "0733 444 555", name: "Simba Supermarket", cvc: "N/A", expiry: "N/A", isDefault: false, balance: 980_000 },
];

const initialTransactions: Transaction[] = [
    { id: "1", ref: "TXN-98213876", amount: 1_240_000, type: "credit", status: "completed", method: "MTN MoMo", branch: "Kicukiro", date: "2026-02-26", desc: "Bulk order payment" },
    { id: "2", ref: "TXN-98213877", amount: 850_000, type: "credit", status: "completed", method: "MTN MoMo", branch: "Remera", date: "2026-02-25", desc: "Dairy products" },
    { id: "3", ref: "TXN-98213878", amount: 320_000, type: "debit", status: "pending", method: "Mastercard", branch: "Headquarters", date: "2026-02-25", desc: "Supplier refund" },
    { id: "4", ref: "TXN-98213879", amount: 2_100_000, type: "credit", status: "completed", method: "Visa", branch: "Nyamirambo", date: "2026-02-24", desc: "Monthly stock" },
    { id: "5", ref: "TXN-98213880", amount: 450_000, type: "debit", status: "failed", method: "Airtel Money", branch: "Gisozi", date: "2026-02-24", desc: "Equipment purchase" },
    { id: "6", ref: "TXN-98213881", amount: 680_000, type: "credit", status: "completed", method: "Cash", branch: "Nyabugogo", date: "2026-02-23", desc: "Walk-in wholesale" },
    { id: "7", ref: "TXN-98213882", amount: 1_550_000, type: "credit", status: "pending", method: "MTN MoMo", branch: "Kicukiro", date: "2026-02-23", desc: "Frozen goods batch" },
    { id: "8", ref: "TXN-98213883", amount: 275_000, type: "debit", status: "completed", method: "Mastercard", branch: "Headquarters", date: "2026-02-22", desc: "Maintenance fee" },
];

const statusConfig: Record<TxStatus, { label: string; icon: React.ElementType; classes: string }> = {
    completed: { label: "Completed", icon: CheckCircle2, classes: "text-[#FF6600] bg-orange-100" },
    pending: { label: "Pending", icon: Clock, classes: "text-orange-700 bg-orange-100" },
    failed: { label: "Failed", icon: XCircle, classes: "text-red-600 bg-red-100" },
};

const methodLogos: Record<PayType, string> = {
    Mastercard: "/master.png",
    Visa: "/visa.png",
    "MTN MoMo": "/mtn.png",
    "Airtel Money": "/aitel.png",
    Cash: "",
};

const methodColors: Record<string, string> = {
    Mastercard: "bg-white",
    Visa: "bg-white",
    "MTN MoMo": "bg-white",
    "Airtel Money": "bg-white",
    Cash: "bg-[#FF6600]",
};

const fmtRWF = (n: number) => n.toLocaleString("en-RW") + " RWF";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
    label, value, sub, trend, up,
}: { label: string; value: string; sub?: string; trend?: string; up?: boolean }) {
    return (
        <Card className="p-5 bg-white border border-border shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">{label}</p>
            <p className="text-2xl font-extrabold text-foreground leading-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            {trend && (
                <div className={cn("flex items-center gap-1 mt-2 text-xs font-semibold", up ? "text-[#FF6600]" : "text-red-500")}>
                    {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend}
                </div>
            )}
        </Card>
    );
}

// ─── Add Method Modal ─────────────────────────────────────────────────────────
function AddMethodModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Omit<PaymentMethod, "id">) => void }) {
    const [form, setForm] = useState({ type: "Mastercard" as PayType, accountNo: "", name: "", cvc: "", expiry: "" });
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const submit = () => {
        if (!form.accountNo || !form.name) return;
        onAdd({ ...form, isDefault: false });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <h3 className="font-bold text-lg">Add Payment Method</h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</Label>
                        <select
                            value={form.type}
                            onChange={(e) => set("type", e.target.value)}
                            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                            {["Mastercard", "Visa", "MTN MoMo", "Airtel Money", "Cash"].map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account / Card Number</Label>
                        <Input placeholder="e.g. 0788 000 111" value={form.accountNo} onChange={(e) => set("accountNo", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name on Account</Label>
                        <Input placeholder="Simba Supermarket" value={form.name} onChange={(e) => set("name", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CVC</Label>
                            <Input placeholder="***" value={form.cvc} onChange={(e) => set("cvc", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expiry</Label>
                            <Input placeholder="MM/YY" value={form.expiry} onChange={(e) => set("expiry", e.target.value)} />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button className="flex-1 bg-[#FF6600] hover:bg-[#E65C00] text-white" onClick={submit}>Add Method</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
    const [methods, setMethods] = useState(initialMethods);
    const [transactions, setTransactions] = useState(initialTransactions);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | TxStatus>("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [maskedCards, setMaskedCards] = useState<Set<number>>(new Set());

    const removeMethod = (id: number) => setMethods((m) => m.filter((x) => x.id !== id));
    const setDefault = (id: number) =>
        setMethods((m) => m.map((x) => ({ ...x, isDefault: x.id === id })));
    const addMethod = (m: Omit<PaymentMethod, "id">) =>
        setMethods((prev) => [...prev, { ...m, id: Date.now() }]);
    const toggleMask = (id: number) =>
        setMaskedCards((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const filtered = transactions.filter((t) => {
        const q = search.toLowerCase();
        const matchSearch = t.ref.toLowerCase().includes(q) || t.branch.toLowerCase().includes(q) || t.method.toLowerCase().includes(q);
        const matchStatus = statusFilter === "all" || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalIn = transactions.filter((t) => t.type === "credit" && t.status === "completed").reduce((a, b) => a + b.amount, 0);
    const totalOut = transactions.filter((t) => t.type === "debit" && t.status === "completed").reduce((a, b) => a + b.amount, 0);
    const pending = transactions.filter((t) => t.status === "pending").reduce((a, b) => a + b.amount, 0);

    return (
        <AdminLayout>
            <div className="p-8 space-y-10 max-w-7xl mx-auto">

                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold">Payments & Billing</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage payment methods, track transactions, and monitor financial flows.
                        </p>
                    </div>
                    <Button className="gap-2 bg-[#FF6600] hover:bg-[#E65C00] text-white rounded-full px-6 shadow-md shadow-orange-100">
                        <Download size={16} /> Export Report
                    </Button>
                </div>

                {/* ── Stats ────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Revenue" value={fmtRWF(totalIn)} sub="From completed payments" trend="+12.4% this month" up />
                    <StatCard label="Total Disbursed" value={fmtRWF(totalOut)} sub="Supplier payouts" trend="+3.1% this month" />
                    <StatCard label="Pending Clearance" value={fmtRWF(pending)} sub={`${transactions.filter((t) => t.status === "pending").length} transactions`} />
                    <StatCard
                        label="Payment Methods"
                        value={methods.length.toString()}
                        sub={`${methods.filter((m) => m.type.includes("MoMo") || m.type.includes("Airtel")).length} mobile, ${methods.filter((m) => m.type === "Mastercard" || m.type === "Visa").length} cards`}
                    />
                </div>

                {/* ── Payment Methods ───────────────────────────────────────── */}
                <section className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Payment Methods</h2>
                            <p className="text-sm text-muted-foreground">Active billing accounts for procurement and transfers.</p>
                        </div>
                        <Button onClick={() => setShowAddModal(true)} className="gap-2 bg-[#FF6600] hover:bg-[#E65C00] text-white rounded-full px-6">
                            <Plus size={16} /> Add Method
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {methods.map((m) => {
                            const isCard = m.type === "Mastercard" || m.type === "Visa";
                            const isMasked = maskedCards.has(m.id);
                            return (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "relative group rounded-2xl border p-5 bg-white shadow-sm hover:shadow-md transition-all",
                                        m.isDefault ? "border-[#FF6600] shadow-orange-100" : "border-border"
                                    )}
                                >
                                    {m.isDefault && (
                                        <span className="absolute -top-2.5 left-5 bg-[#FF6600] text-white text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                            <Star size={9} /> Default
                                        </span>
                                    )}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center border border-border overflow-hidden bg-white shadow-sm shrink-0", methodColors[m.type])}>
                                                {methodLogos[m.type] ? (
                                                    <img src={methodLogos[m.type]} alt={m.type} className="w-10 h-10 object-contain p-1" />
                                                ) : (
                                                    <Wallet size={24} className="text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{m.type}</p>
                                                <p className="text-xs text-muted-foreground">{m.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => toggleMask(m.id)}
                                                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                                                title={isMasked ? "Show" : "Hide"}
                                            >
                                                {isMasked ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>
                                            {!m.isDefault && (
                                                <button
                                                    onClick={() => setDefault(m.id)}
                                                    className="p-1.5 hover:bg-orange-50 rounded-lg text-muted-foreground hover:text-[#FF6600] transition-colors"
                                                    title="Set as default"
                                                >
                                                    <Shield size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => removeMethod(m.id)}
                                                className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Account No.</span>
                                            <span className="font-bold tracking-widest">
                                                {isMasked ? "●●●● ●●●● ●●●●" : m.accountNo}
                                            </span>
                                        </div>
                                        {isCard && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Expiry</span>
                                                <span className="font-medium">{isMasked ? "**/**" : m.expiry}</span>
                                            </div>
                                        )}
                                        {m.balance !== undefined && (
                                            <div className="flex justify-between items-center pt-1 border-t border-border mt-2">
                                                <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Balance</span>
                                                <span className="font-bold text-[#FF6600]">{isMasked ? "●●●●●●" : fmtRWF(m.balance)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {!m.isDefault && (
                                        <button
                                            onClick={() => setDefault(m.id)}
                                            className="mt-4 text-xs text-[#FF6600] font-semibold hover:underline"
                                        >
                                            Set as default →
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Transaction History ────────────────────────────────────── */}
                <section className="space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-xl font-bold">Transaction History</h2>
                            <p className="text-sm text-muted-foreground">All payment activity across branches.</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search transactions…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-52 text-sm"
                                />
                            </div>
                            {/* Status filter */}
                            <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                                {(["all", "completed", "pending", "failed"] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                                            statusFilter === s
                                                ? "bg-white shadow text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#FF6600] to-orange-500 text-white">
                                    <th className="py-4 px-5 text-left font-semibold text-[11px] uppercase tracking-wider">Reference</th>
                                    <th className="py-4 px-5 text-left font-semibold text-[11px] uppercase tracking-wider">Description</th>
                                    <th className="py-4 px-5 text-left font-semibold text-[11px] uppercase tracking-wider">Branch</th>
                                    <th className="py-4 px-5 text-left font-semibold text-[11px] uppercase tracking-wider">Method</th>
                                    <th className="py-4 px-5 text-left font-semibold text-[11px] uppercase tracking-wider">Date</th>
                                    <th className="py-4 px-5 text-left font-semibold text-[11px] uppercase tracking-wider">Amount</th>
                                    <th className="py-4 px-5 text-left font-semibold text-[11px] uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                            No transactions match your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((t) => {
                                        const { label, icon: StatusIcon, classes } = statusConfig[t.status];
                                        return (
                                            <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="py-4 px-5 font-mono font-semibold text-xs text-[#FF6600]">{t.ref}</td>
                                                <td className="py-4 px-5 text-muted-foreground">{t.desc}</td>
                                                <td className="py-4 px-5 font-medium">{t.branch}</td>
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-10 h-10 rounded-full border border-border flex items-center justify-center overflow-hidden shrink-0", t.method === "Cash" ? "bg-[#FF6600]" : "bg-white")}>
                                                            {methodLogos[t.method] ? (
                                                                <img src={methodLogos[t.method]} alt={t.method} className="w-7 h-7 object-contain" />
                                                            ) : (
                                                                <Wallet size={16} className="text-white" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-medium">{t.method}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 text-muted-foreground text-xs">{t.date}</td>
                                                <td className="py-4 px-5">
                                                    <span className={cn("font-bold", t.type === "credit" ? "text-[#FF6600]" : "text-red-500")}>
                                                        {t.type === "credit" ? "+" : "−"}{fmtRWF(t.amount)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold", classes)}>
                                                        <StatusIcon size={11} />
                                                        {label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Showing {filtered.length} of {transactions.length} transactions
                    </p>
                </section>
            </div>

            {showAddModal && (
                <AddMethodModal onClose={() => setShowAddModal(false)} onAdd={addMethod} />
            )}
        </AdminLayout>
    );
}