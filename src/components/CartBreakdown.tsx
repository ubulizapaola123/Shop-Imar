"use client";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import { useState } from "react";

const initialItems = [
    { id: 1, name: "Inyange Whole Milk 500ml", price: 600, quantity: 4, image: "/placeholder.svg" },
    { id: 2, name: "Bakers Choice Sliced Bread", price: 1000, quantity: 2, image: "/placeholder.svg" },
    { id: 3, name: "Hillside Fresh Eggs (12pk)", price: 2500, quantity: 1, image: "/placeholder.svg" },
    { id: 4, name: "Simba Roasted Coffee 250g", price: 4500, quantity: 2, image: "/placeholder.svg" },
];

export function CartBreakdown() {
    const [items, setItems] = useState(initialItems);

    const updateQuantity = (id: number, delta: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        ));
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product List */}
            <div className="lg:col-span-2 overflow-hidden border border-border rounded-lg bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-[#FF6600] text-white">
                        <tr>
                            <th className="py-4 px-6 text-left font-semibold">Product</th>
                            <th className="py-4 px-6 text-left font-semibold">Price</th>
                            <th className="py-4 px-6 text-left font-semibold">Quantity</th>
                            <th className="py-4 px-6 text-left font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-6 px-6">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                            <X size={16} />
                                        </button>
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-border" />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                </td>
                                <td className="py-6 px-6 text-muted-foreground">{item.price} RWF</td>
                                <td className="py-6 px-6">
                                    <div className="flex items-center border border-border rounded-md w-fit">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-muted transition-colors">
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-4 font-semibold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-muted transition-colors">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="py-6 px-6 font-bold">{item.price * item.quantity} RWF</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Cart Total */}
            <div className="space-y-6">
                <Card className="p-0 overflow-hidden">
                    <div className="bg-[#FF6600] text-white p-4">
                        <h3 className="font-bold">Cart Total</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between border-b pb-4">
                            <span className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Subtotal</span>
                            <span className="font-semibold">{subtotal} RWF</span>
                        </div>
                        <div className="flex justify-between border-b pb-4">
                            <span className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Discount</span>
                            <span className="text-muted-foreground">---</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2">
                            <span className="uppercase text-xs font-bold tracking-wider self-center text-primary">Total</span>
                            <span className="text-primary">{subtotal} RWF</span>
                        </div>
                        <Button className="w-full bg-[#FF6600] hover:bg-[#E65C00] text-white py-6 mt-4 rounded-full font-bold shadow-lg shadow-orange-200">
                            Proceed To Checkout
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Recommendations */}
            <div className="lg:col-span-full pt-8 space-y-6">
                <h2 className="text-2xl font-bold">You May Also Like</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { name: "Inyange Passion Fruit", category: "Drink", price: 1200, oldPrice: 1500 },
                        { name: "Skol Lager 330ml", category: "Beverage", price: 1000, oldPrice: 1200 },
                        { name: "Simba Salt 1kg", category: "Pantry", price: 800, oldPrice: 1000 },
                        { name: "Akabanga Oil", category: "Spice", price: 1500, oldPrice: 2000 },
                    ].map((product, i) => (
                        <div key={i} className="space-y-3 group">
                            <div className="relative aspect-[3/4] bg-muted rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                                <span className="absolute top-3 left-3 bg-[#FF6600] text-white text-[10px] px-2 py-1 rounded-full font-bold">
                                    -15%
                                </span>
                                <img src="/placeholder.svg" alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-xs uppercase tracking-tighter font-bold">{product.category}</p>
                                <h4 className="font-bold text-sm">{product.name}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="space-x-2">
                                        <span className="text-primary font-bold">{product.price} RWF</span>
                                        <span className="text-muted-foreground text-xs line-through">{product.oldPrice} RWF</span>
                                    </div>
                                    <button className="w-8 h-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
