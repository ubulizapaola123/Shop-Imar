"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Lock, MapPin } from "lucide-react";

export default function SettingsPage() {
    return (
        <AdminLayout>
            <div className="p-8 max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-center mb-8">Account Settings</h1>

                {/* Profile Information */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input id="firstName" defaultValue="Peter" className="bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input id="lastName" defaultValue="Ducker" className="bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Input id="email" defaultValue="peterducker312@gmail.com" className="bg-muted/30" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="flex gap-2">
                                <Input id="phone" defaultValue="(+1) - 234 - 687215421" className="bg-muted/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Change Password</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" placeholder="******************" className="bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" placeholder="******************" className="bg-muted/30" />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Address</h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Shipping address</Label>
                            <textarea
                                id="address"
                                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="Your address"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" placeholder="Your state" className="bg-muted/30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input id="zipCode" placeholder="Your zip code" className="bg-muted/30" />
                            </div>
                        </div>
                    </div>
                </div>

                <Button className="w-full py-6 text-lg bg-[#A3521E] hover:bg-[#8B4513] text-white rounded-full">
                    Save Changes
                </Button>
            </div>
        </AdminLayout>
    );
}
