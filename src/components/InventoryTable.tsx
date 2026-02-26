'use client'
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Search, Filter, MoreVertical, Loader2, Package } from "lucide-react";
import { Badge } from "./ui/badge";

const mockInventory = [
    { id: 1, name: "Simba Milk 1L", category: "Dairy", stock: 45, price: "1,200 RWF", status: "In Stock" },
    { id: 2, name: "Huye Coffee 500g", category: "Beverages", stock: 12, price: "8,500 RWF", status: "Low Stock" },
    { id: 3, name: "Bakers Choice Bread", category: "Bakery", stock: 0, price: "1,000 RWF", status: "Out of Stock" },
    { id: 4, name: "Indomie Chicken 70g", category: "Food", stock: 120, price: "400 RWF", status: "In Stock" },
    { id: 5, name: "Skol Lager 330ml", category: "Beverages", stock: 85, price: "1,000 RWF", status: "In Stock" },
];

export function InventoryTable() {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Inventory Overview</h3>

                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10 h-9 bg-muted/50 border-0"
                        />
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto relative min-h-[200px]">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                                <Checkbox />
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">PRODUCT NAME</th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">CATEGORY</th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">STOCK</th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">PRICE</th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">STATUS</th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockInventory.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                <td className="py-4 px-4">
                                    <Checkbox />
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Package className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                        {item.category}
                                    </Badge>
                                </td>
                                <td className="py-4 px-4 text-sm font-medium">{item.stock} units</td>
                                <td className="py-4 px-4 text-sm font-medium">{item.price}</td>
                                <td className="py-4 px-4">
                                    <Badge
                                        className={
                                            item.status === "In Stock"
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : item.status === "Low Stock"
                                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                        }
                                    >
                                        {item.status}
                                    </Badge>
                                </td>
                                <td className="py-4 px-4">
                                    <button className="p-1 hover:bg-muted rounded transition-colors">
                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
