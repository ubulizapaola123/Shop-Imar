"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { InventoryTable } from "@/components/InventoryTable";
import { StatCard } from "@/components/StatCard";
import { Package, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";

export default function InventoryPage() {
    return (
        <AdminLayout>
            <div className="p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Simba Inventory</h1>
                    <p className="text-muted-foreground">Manage supermarket stock across all branches, categories, and suppliers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Package}
                        label="Total SKU"
                        value="14,250"
                        change="+234 today"
                        isPositive={true}
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Low Stock Items"
                        value="42"
                        change="-5 from yesterday"
                        isPositive={true}
                    />
                    <StatCard
                        icon={TrendingDown}
                        label="Out of Stock"
                        value="12"
                        change="+2 since Monday"
                        isPositive={false}
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Active Suppliers"
                        value="156"
                        change="Stable"
                        isPositive={true}
                    />
                </div>

                <InventoryTable />
            </div>
        </AdminLayout>
    );
}
