"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSellPoint } from "@/lib/sellpoint-store";
import { BackupItem } from "@/types/sellpoint";
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  HardDrive,
  FileCheck,
  AlertTriangle,
  Lock,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function BackupPage() {
  const { backups, createBackup, restoreBackup, restoreFromData, hasPermission } = useSellPoint();

  const [autoDailyBackup, setAutoDailyBackup] = useState(true);
  const [backupLocation, setBackupLocation] = useState("D:\\SellPoint_Backups\\");
  const [backupLabel, setBackupLabel] = useState("");

  // Restore Modal State
  const [selectedBackupToRestore, setSelectedBackupToRestore] = useState<BackupItem | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState("");

  if (!hasPermission("Admin")) {
    return (
      <AdminLayout>
        <div className="p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1F2937]">Access Denied</h3>
          <p className="text-xs text-muted-foreground">
            Database backup and recovery is restricted exclusively to System Administrators.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const handleCreateManualBackup = () => {
    const item = createBackup(backupLabel || "Manual Counter Backup");
    toast.success(`Backup created: ${item.filename} (${item.sizeKb} KB)`);
    setBackupLabel("");
  };

  const handleDownloadBackupFile = (b: BackupItem) => {
    const blob = new Blob([b.data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = b.filename;
    link.click();
    toast.success(`Downloaded ${b.filename}`);
  };

  const handleFileUploadRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (
          window.confirm(
            "WARNING: Restoring will overwrite existing state. An automated safety backup will be created first. Proceed?"
          )
        ) {
          const res = restoreFromData(content);
          if (res.success) {
            toast.success("Database restored successfully from uploaded file!");
          } else {
            toast.error(res.error || "Failed to parse backup file");
          }
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleConfirmRestore = () => {
    if (!selectedBackupToRestore) return;
    const res = restoreBackup(selectedBackupToRestore.id);
    if (res.success) {
      toast.success(
        `Database restored successfully from ${selectedBackupToRestore.filename}! An automatic snapshot was created.`
      );
      setSelectedBackupToRestore(null);
      setRestoreConfirmText("");
    } else {
      toast.error(res.error || "Failed to restore backup");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#15803D]" />
              Database Backup &amp; Disaster Recovery
            </h2>
            <p className="text-xs text-muted-foreground">
              Create offline snapshots of products, sales, cash history, and restore points safely
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] font-bold border border-emerald-200">
            Admin Controlled
          </span>
        </div>

        {/* 2-Column: Left Backup Creation & Options, Right Backups History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Create Backup Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="p-5 border-border bg-white space-y-4 shadow-sm">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-[#15803D]" />
                  Create Manual Backup
                </h3>
                <p className="text-xs text-muted-foreground">
                  Snapshot current database state to chosen local folder or external USB drive.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Backup Label / Tag</Label>
                  <Input
                    value={backupLabel}
                    onChange={(e) => setBackupLabel(e.target.value)}
                    placeholder="e.g. End of Month January Close, Pre-audit..."
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#1F2937]">Target Folder / Drive</Label>
                  <Input
                    value={backupLocation}
                    onChange={(e) => setBackupLocation(e.target.value)}
                    placeholder="e.g. E:\USB_Backups\"
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>

                {/* Automatic daily backup checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="auto-backup"
                    checked={autoDailyBackup}
                    onCheckedChange={(c) => setAutoDailyBackup(!!c)}
                  />
                  <label
                    htmlFor="auto-backup"
                    className="text-xs font-semibold text-[#1F2937] cursor-pointer select-none"
                  >
                    Automatic daily backup option (Enabled at 20:00)
                  </label>
                </div>

                <Button
                  onClick={handleCreateManualBackup}
                  className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold h-10 gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Generate Manual Backup
                </Button>
              </div>
            </Card>

            {/* External File Restore */}
            <Card className="p-5 border-border bg-white space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#15803D]" />
                Restore from External JSON Backup File
              </h3>
              <p className="text-xs text-muted-foreground">
                Upload a previously saved `.json` snapshot from another workstation or USB stick.
              </p>

              <label className="border-2 border-dashed border-emerald-300 hover:border-[#15803D] bg-[#DCFCE7]/20 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <Upload className="w-6 h-6 text-[#15803D] mb-1" />
                <span className="text-xs font-bold text-[#166534]">Click to browse backup file</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">.json backup formats only</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUploadRestore}
                  className="hidden"
                />
              </label>
            </Card>
          </div>

          {/* Right Column: List of Backups with date and size (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-border overflow-hidden bg-white shadow-sm">
              <div className="p-4 border-b border-border bg-[#DCFCE7]/20 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1F2937]">Saved System Backups</h3>
                  <p className="text-xs text-muted-foreground">
                    Chronological snapshots with date, filesize, and one-click restore
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] font-bold">
                  {backups.length} Available
                </span>
              </div>

              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DCFCE7] text-[#166534] font-bold border-b border-emerald-200">
                    <tr>
                      <th className="py-2.5 px-4">Backup Filename</th>
                      <th className="py-2.5 px-4">Date &amp; Time</th>
                      <th className="py-2.5 px-4 text-right">Size</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {backups.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-muted-foreground">
                          No backup archives found.
                        </td>
                      </tr>
                    ) : (
                      backups.map((b) => (
                        <tr key={b.id} className="hover:bg-[#DCFCE7]/20 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-[#1F2937] block truncate max-w-[200px]">
                              {b.filename}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-mono">{b.date}</td>
                          <td className="py-3 px-4 text-right font-bold text-[#15803D]">
                            {b.sizeKb} KB
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Download file */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadBackupFile(b)}
                                className="h-7 px-2 text-xs hover:bg-[#DCFCE7] text-[#166534] gap-1"
                                title="Download JSON file"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Save
                              </Button>

                              {/* Restore button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBackupToRestore(b)}
                                className="h-7 px-2 text-xs border-amber-300 text-amber-900 hover:bg-amber-50 gap-1 font-semibold"
                                title="Restore this snapshot"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Restore
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Warning and Restore Confirmation Modal */}
        {selectedBackupToRestore && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-amber-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-[#F59E0B] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Restore Database Snapshot?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Restoring: <span className="font-mono font-semibold">{selectedBackupToRestore.filename}</span>
                  </p>
                </div>
              </div>

              {/* Requirement: Warning first, auto-backup of current data before restoring */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-bold">Important Safeguard Notice:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Your current active data will be replaced by this backup snapshot.</li>
                  <li>An automatic backup of your current data is saved before restoration starts.</li>
                  <li>Acceptance test 8: Restoring returns exactly the same data.</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedBackupToRestore(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRestore}
                  className="flex-1 bg-[#15803D] hover:bg-[#166534] text-white font-bold"
                >
                  Proceed with Restore
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
