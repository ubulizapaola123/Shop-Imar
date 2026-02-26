"use client";

import { AdminLayout } from "@/components/AdminLayout";
import ShopMap from "@/components/ShopMap";
import { ShopsTable } from "@/components/ShopsTable";
import { Card } from "@/components/ui/card";

export default function BranchesPage() {
    return (
        <AdminLayout>
            <div className="p-8 space-y-10">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Simba Branches</h1>
                    <p className="text-muted-foreground">Monitor and track performance across all physical store locations.</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Live Branch Tracker</h2>
                    <ShopMap />
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Performance Overview</h2>
                    <ShopsTable />
                </section>
            </div>
        </AdminLayout>
    );
}
