"use client";

import {
  LayoutDashboard, Store, MapPin, Users, CreditCard,
  ChevronLeft, MoreVertical, Upload, Camera, ShoppingCart,
  Package, BarChart3, Settings,
} from "lucide-react";
import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { useUserProfile } from "@/contexts/UserProfileContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: MapPin, label: "Branches", path: "/branches" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: ShoppingCart, label: "Cart & Checkout", path: "/cart" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { profileImage, setProfileImage, adminName, adminEmail } = useUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#FF6600] flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
              <Store className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-lg text-foreground tracking-tight">
                Simba
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform duration-300", isCollapsed && "rotate-180")}
            />
          </Button>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {!isCollapsed && (
          <p className="text-[10px] text-muted-foreground px-3 mb-3 uppercase tracking-widest font-semibold">
            Main Menu
          </p>
        )}
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#FF6600] text-white shadow-md shadow-orange-200"
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

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Avatar className="w-10 h-10 cursor-pointer">
              <AvatarImage src={profileImage || undefined} alt={adminName} />
              <AvatarFallback className="bg-[#FF6600] text-white font-bold">
                {getInitials(adminName)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border-2 border-white shadow-sm hover:bg-orange-50"
                onClick={() => fileInputRef.current?.click()}
                title="Upload photo"
              >
                <Camera className="h-2.5 w-2.5 text-[#FF6600]" />
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
                <p className="text-sm font-semibold truncate text-foreground">{adminName}</p>
                <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
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
