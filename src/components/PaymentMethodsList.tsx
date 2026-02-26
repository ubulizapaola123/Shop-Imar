"use client";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X, CreditCard, Wallet } from "lucide-react";

const mockMethods = [
    { id: 1, type: "Mastercard", last4: "2138", cardNo: "2736 3286 8332 2138", name: "Simba Admin", cvc: "258", expiry: "10/26", isDefault: true },
    { id: 2, type: "Visa", last4: "4421", cardNo: "4215 3286 8332 4421", name: "Simba Admin", cvc: "123", expiry: "12/25", isDefault: false },
    { id: 3, type: "Momo", last4: "8821", cardNo: "0788 111 222", name: "Simba Supermarket", cvc: "N/A", expiry: "N/A", isDefault: false },
];

export function PaymentMethodsList() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Payment Methods</h2>
                <p className="text-muted-foreground">Manage your payment options for procurement and customer refunds.</p>
            </div>

            <div className="space-y-4">
                {mockMethods.map((method) => (
                    <div key={method.id} className="relative bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        {method.isDefault && (
                            <span className="absolute top-0 right-12 translate-y-[-50%] bg-[#FF6600] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase">
                                Default
                            </span>
                        )}
                        <button className="absolute top-6 right-6 text-muted-foreground hover:text-destructive transition-colors">
                            <X size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Card/Account Number</Label>
                                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-transparent">
                                    <div className={`w-8 h-5 rounded-sm ${method.type === 'Visa' ? 'bg-blue-600' : method.type === 'Momo' ? 'bg-yellow-400' : 'bg-red-600'}`} />
                                    <span className="text-sm font-bold tracking-wider">{method.cardNo}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Name On Account</Label>
                                <div className="bg-muted/30 p-3 rounded-lg border border-transparent h-[46px] flex items-center">
                                    <span className="text-sm font-medium">{method.name}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">CVC / Type</Label>
                                <div className="bg-muted/30 p-3 rounded-lg border border-transparent h-[46px] flex items-center">
                                    <span className="text-sm font-medium">{method.cvc}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Expiry Date</Label>
                                <div className="bg-muted/30 p-3 rounded-lg border border-transparent h-[46px] flex items-center">
                                    <span className="text-sm font-medium">{method.expiry}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button className="w-fit px-12 py-6 text-lg bg-[#FF6600] hover:bg-[#E65C00] text-white rounded-full font-bold shadow-lg shadow-orange-100">
                Add New Method
            </Button>
        </div>
    );
}
