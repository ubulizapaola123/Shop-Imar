"use client";

import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ExternalLink, ArrowRight, Package, ShoppingBag, Clock } from "lucide-react";

const mockOrders = [
    { id: "2133", product: "Simba Fresh Milk 1L", image: "/placeholder.svg", status: "In Progress", trackingId: "2176413876", deliveryDate: "23-07-2024 (Expected)", price: "$12.20" },
    { id: "2134", product: "Inyange Orange Juice", image: "/placeholder.svg", status: "Ordered", trackingId: "2176413877", deliveryDate: "24-07-2024 (Scheduled)", price: "$8.50" },
    { id: "2135", product: "Bakers Choice Brown Bread", image: "/placeholder.svg", status: "In Stock", trackingId: "2176413878", deliveryDate: "Available Now", price: "$2.00" },
    { id: "2136", product: "Gorilla Coffee 500g", image: "/placeholder.svg", status: "In Progress", trackingId: "2176413879", deliveryDate: "25-07-2024 (Expected)", price: "$15.00" },
    { id: "2137", product: "Sulfo Rice 5kg", image: "/placeholder.svg", status: "Ordered", trackingId: "2176413880", deliveryDate: "26-07-2024 (Scheduled)", price: "$22.40" },
];

export function OrderHistoryTable() {
    return (
        <div className="space-y-6">
            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-[#FF6600] text-white">
                        <tr>
                            <th className="py-4 px-6 text-left font-semibold">Order no</th>
                            <th className="py-4 px-6 text-left font-semibold">Items</th>
                            <th className="py-4 px-6 text-left font-semibold">Status</th>
                            <th className="py-4 px-6 text-left font-semibold">Tracking ID</th>
                            <th className="py-4 px-6 text-left font-semibold">Delivery Date</th>
                            <th className="py-4 px-6 text-left font-semibold">Price</th>
                            <th className="py-4 px-6 text-left font-semibold"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                        {mockOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-6 px-6 font-medium">{order.id}</td>
                                <td className="py-6 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                            <img src={order.image} alt={order.product} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-medium">{order.product}</span>
                                    </div>
                                </td>
                                <td className="py-6 px-6">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-md w-fit text-[11px] font-bold uppercase tracking-wider
                                        ${order.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                            order.status === "In Stock" ? "bg-green-100 text-green-700" :
                                                "bg-orange-100 text-[#FF6600]"}`}
                                    >
                                        {order.status === "In Progress" && <Clock className="w-3 h-3" />}
                                        {order.status === "In Stock" && <Package className="w-3 h-3" />}
                                        {order.status === "Ordered" && <ShoppingBag className="w-3 h-3" />}
                                        {order.status}
                                    </div>
                                </td>
                                <td className="py-6 px-6">
                                    <div className="flex items-center gap-2 underline text-muted-foreground cursor-pointer decoration-dotted">
                                        {order.trackingId}
                                        <ExternalLink size={14} />
                                    </div>
                                </td>
                                <td className="py-6 px-6 text-muted-foreground">
                                    {order.deliveryDate}
                                </td>
                                <td className="py-6 px-6 font-bold">{order.price}</td>
                                <td className="py-6 px-6">
                                    <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all group">
                                        Re-Order
                                        <ArrowRight size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
