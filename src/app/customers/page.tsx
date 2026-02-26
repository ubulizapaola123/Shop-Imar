"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { UsersTable } from "@/components/UsersTable";
import { StatCard } from "@/components/StatCard";
import { Users, UserCheck, UserPlus, Star } from "lucide-react";

export default function CustomersPage() {
    return (
        <AdminLayout>
            <div className="p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Simba Customers</h1>
                    <p className="text-muted-foreground">Detailed database of registered shoppers and loyalty card holders.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Users}
                        label="Total Shoppers"
                        value="45,210"
                        change="+4.3%"
                        isPositive={true}
                    />
                    <StatCard
                        icon={UserCheck}
                        label="Active Today"
                        value="2,415"
                        change="+12.5%"
                        isPositive={true}
                    />
                    <StatCard
                        icon={Star}
                        label="Gold Members"
                        value="1,062"
                        change="+30 new"
                        isPositive={true}
                    />
                    <StatCard
                        icon={UserPlus}
                        label="New Signups"
                        value="84"
                        change="+8.7%"
                        isPositive={true}
                    />
                </div>

                <UsersTable />
            </div>
        </AdminLayout>
    );
}
