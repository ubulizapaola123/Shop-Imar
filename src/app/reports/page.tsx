"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/RevenueChart";
import { LeadSourcesChart } from "@/components/LeadSourcesChart";
import { AdminPayment } from "@/components/AdminPayment";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Wallet } from "lucide-react";

export default function ReportsPage() {
    return (
        <AdminLayout>
            <div className="p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Simba Reports &amp; Analytics</h1>
                    <p className="text-muted-foreground">Detailed financial and operational performance metrics for all supermarket branches.</p>
                </div>

                {/* Stat Cards — same style as main dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={DollarSign}
                        label="Daily Revenue"
                        value="$12,450"
                        change="+12.3%"
                        isPositive={true}
                    />
                    <StatCard
                        icon={BarChart3}
                        label="Monthly Sales"
                        value="$342,800"
                        change="+5.4%"
                        isPositive={true}
                    />
                    <StatCard
                        icon={Wallet}
                        label="Avg. Basket Value"
                        value="$28.50"
                        change="-1.2%"
                        isPositive={false}
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Net Profit"
                        value="$45,210"
                        change="+8.1%"
                        isPositive={true}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <RevenueChart />
                    <AdminPayment />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <LeadSourcesChart />
                    </div>
                    <Card className="lg:col-span-2 p-6">
                        <h3 className="text-lg font-semibold mb-6">Top Selling Branches</h3>
                        <div className="space-y-6">
                            {[
                                { name: "Simba City Center", sales: "$142k", growth: 85, positive: true },
                                { name: "Simba Gishushu", sales: "$98k", growth: 65, positive: true },
                                { name: "Simba Kimironko", sales: "$76k", growth: 50, positive: true },
                                { name: "Simba Nyamirambo", sales: "$54k", growth: 35, positive: false },
                            ].map((branch) => (
                                <div key={branch.name} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{branch.name}</span>
                                        <span className={branch.positive ? "text-primary font-semibold" : "text-destructive font-semibold"}>
                                            {branch.sales}
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${branch.positive ? "bg-primary" : "bg-destructive"}`}
                                            style={{ width: `${branch.growth}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}

