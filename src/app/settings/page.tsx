"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import {
  Settings as SettingsIcon,
  Store,
  Printer,
  Globe,
  Sliders,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateSettings, resetAllData, hasPermission } = useSellPoint();

  // Settings State initialized from current store
  const [shopName, setShopName] = useState(settings.shopName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [tin, setTin] = useState(settings.tin);
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [printer, setPrinter] = useState(settings.printer);
  const [language, setLanguage] = useState<"English" | "Kinyarwanda" | "French">(settings.language);

  // Output reasons list
  const [outputReasons, setOutputReasons] = useState<string[]>([...settings.outputReasons]);
  const [newReasonInput, setNewReasonInput] = useState("");

  // Business Rules
  const [allowNegativeStock, setAllowNegativeStock] = useState(settings.allowNegativeStock);
  const [allowBackdatedSales, setAllowBackdatedSales] = useState(settings.allowBackdatedSales);

  const handleAddReason = () => {
    if (!newReasonInput.trim()) return;
    if (outputReasons.includes(newReasonInput.trim())) {
      toast.error("Category already exists");
      return;
    }
    setOutputReasons((prev) => [...prev, newReasonInput.trim()]);
    setNewReasonInput("");
    toast.success("Added expense category");
  };

  const handleRemoveReason = (r: string) => {
    if (outputReasons.length <= 1) {
      toast.error("You must keep at least one output category");
      return;
    }
    setOutputReasons((prev) => prev.filter((item) => item !== r));
  };

  const handleSaveSettings = () => {
    updateSettings({
      shopName: shopName.trim() || "Sell Point",
      address: address.trim(),
      phone: phone.trim(),
      tin: tin.trim(),
      receiptHeader: receiptHeader.trim(),
      receiptFooter: receiptFooter.trim(),
      printer,
      language,
      outputReasons,
      allowNegativeStock,
      allowBackdatedSales,
    });
    toast.success("Shop settings saved successfully");
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all mock products, users, and transactions to factory defaults?"
      )
    ) {
      resetAllData();
      toast.info("Database reset to initial sample state");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-[#15803D]" />
              Shop Configuration &amp; Business Rules
            </h2>
            <p className="text-xs text-muted-foreground">
              Counter receipt headers, fiscal TIN, printer profile, language, and inventory enforcement rules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveSettings}
              className="gap-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold h-9 shadow-sm text-xs"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
          </div>
        </div>

        {/* 2-Column: General Info, Receipt & Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Shop Identity & Fiscal (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <Card className="p-5 border-border bg-white space-y-4 shadow-sm">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#15803D]" />
                  Shop Identity &amp; Location
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Shop / Business Name</Label>
                  <Input
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="mt-1 h-9 text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Address / Market Location</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Nyarugenge Market, Floor 1, Shop 42, Kigali"
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">Telephone Contact</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 788 123 456"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">RRA TIN (Tax Number)</Label>
                    <Input
                      value={tin}
                      onChange={(e) => setTin(e.target.value)}
                      placeholder="100234567"
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">System Language</Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:ring-1 focus-visible:ring-[#15803D]"
                    >
                      <option value="English">English</option>
                      <option value="Kinyarwanda">Ikinyarwanda</option>
                      <option value="French">Français</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-[#1F2937]">POS Printer Type</Label>
                    <Input
                      value={printer}
                      onChange={(e) => setPrinter(e.target.value)}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Expense Output Reasons Config */}
            <Card className="p-5 border-border bg-white space-y-4 shadow-sm">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-sm font-bold text-[#1F2937]">Output Expense Categories</h3>
                <p className="text-xs text-muted-foreground">
                  Available in the reasons dropdown on the Output page
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newReasonInput}
                  onChange={(e) => setNewReasonInput(e.target.value)}
                  placeholder="New reason category (e.g. Repairs, Electricity)"
                  className="h-9 text-xs"
                />
                <Button
                  onClick={handleAddReason}
                  size="sm"
                  className="bg-[#15803D] hover:bg-[#166534] text-white shrink-0 gap-1 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {outputReasons.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-semibold border border-emerald-200"
                  >
                    {r}
                    <button
                      onClick={() => handleRemoveReason(r)}
                      className="hover:text-red-700 font-bold"
                      title="Remove"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Receipt Header/Footer & System Rules (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Receipt Header & Footer */}
            <Card className="p-5 border-border bg-white space-y-4 shadow-sm">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-[#15803D]" />
                  Thermal Receipt Layout
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">
                    Receipt Header (Printed at top of ticket)
                  </Label>
                  <textarea
                    rows={3}
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-xs font-mono focus-visible:ring-1 focus-visible:ring-[#15803D]"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">
                    Receipt Footer Note (Printed at bottom)
                  </Label>
                  <textarea
                    rows={3}
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-xs font-mono focus-visible:ring-1 focus-visible:ring-[#15803D]"
                  />
                </div>
              </div>
            </Card>

            {/* Business Rules */}
            <Card className="p-5 border-border bg-white space-y-4 shadow-sm">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#15803D]" />
                  Operational Rules &amp; Strictness
                </h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-border">
                  <Checkbox
                    id="negative-stock"
                    checked={allowNegativeStock}
                    onCheckedChange={(c) => setAllowNegativeStock(!!c)}
                    className="mt-0.5"
                  />
                  <div>
                    <label
                      htmlFor="negative-stock"
                      className="text-xs font-bold text-[#1F2937] cursor-pointer"
                    >
                      Allow negative stock during checkout
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      When unchecked, sales are strictly blocked if product quantity is less than requested quantity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-border">
                  <Checkbox
                    id="backdated-sales"
                    checked={allowBackdatedSales}
                    onCheckedChange={(c) => setAllowBackdatedSales(!!c)}
                    className="mt-0.5"
                  />
                  <div>
                    <label
                      htmlFor="backdated-sales"
                      className="text-xs font-bold text-[#1F2937] cursor-pointer"
                    >
                      Allow back-dated sales and entries
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Enables operators to enter sales or expenses completed on earlier dates.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Factory Reset Option */}
            <Card className="p-4 border-red-200 bg-red-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#DC2626]">Factory Reset Sample Data</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Restores ~30 products, 3 users, and default sales/credits.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDefaults}
                  className="border-red-300 text-[#DC2626] hover:bg-red-50 text-xs shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset Store
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
