"use client";

import { LayoutDashboard, Store, MapPin, Users, CreditCard, ChevronLeft, MoreVertical, Upload, Camera } from "lucide-react";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Store, label: "Shops", path: "/shops" },
  { icon: MapPin, label: "Shop Map", path: "/map" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header Section with Shoppa Branding */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-success flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-foreground">Shoppa</span>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Menu Section */}
      <div className="flex-1 overflow-y-auto p-6">
        {!isCollapsed && (
          <p className="text-xs text-muted-foreground px-3 mb-4 uppercase tracking-wider">
            MAIN MENU
          </p>
        )}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-success text-white hover:bg-success/90"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Profile Section at Bottom */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Avatar className="w-10 h-10 cursor-pointer">
              <AvatarImage src={profileImage || undefined} alt="Admin User" />
              <AvatarFallback className="bg-success text-white font-semibold">
                {getInitials("Admin User")}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-background shadow-sm hover:bg-muted"
                onClick={handleUploadClick}
                title="Upload photo"
              >
                <Camera className="h-3 w-3" />
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  Admin User
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  admin@shoppa.rw
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleUploadClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
