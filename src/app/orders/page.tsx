"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { OrderHistoryTable } from "@/components/OrderHistoryTable";

export default function OrdersPage() {
    return (
        <AdminLayout>
            <div className="p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Order History</h1>
                    <p className="text-muted-foreground">
                        Review your past purchases, track current orders, and manage your shopping details quickly and easily.
                    </p>
                </div>

                <OrderHistoryTable />
            </div>
        </AdminLayout>
    );
}
