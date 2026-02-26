"use client";

import { Search, Bell, X, ShoppingBag, CreditCard, AlertTriangle, Info, Check, CheckCheck, Camera, Upload } from "lucide-react";
import { Input } from "./ui/input";
import { usePathname } from "next/navigation";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

const routeTitles: Record<string, string> = {
  "/": "Dashboard Overview",
  "/inventory": "Inventory Management",
  "/orders": "Orders",
  "/customers": "Customers",
  "/branches": "Branches",
  "/reports": "Reports & Analytics",
  "/payments": "Payments",
  "/cart": "Cart & Checkout",
  "/settings": "Settings",
  "/users": "Users",
  "/map": "Branch Map",
};

const notificationIcons = {
  order: ShoppingBag,
  payment: CreditCard,
  alert: AlertTriangle,
  info: Info,
};

const notificationColors = {
  order: "text-blue-500 bg-blue-50",
  payment: "text-[#FF6600] bg-orange-50",
  alert: "text-orange-500 bg-orange-50",
  info: "text-gray-500 bg-gray-100",
};

export function Navbar() {
  const pathname = usePathname();
  const {
    profileImage,
    setProfileImage,
    adminName,
    adminEmail,
    notifications,
    markAllRead,
    markRead,
    unreadCount,
  } = useUserProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const pageTitle = routeTitles[pathname] ?? "Dashboard";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="border-b border-border bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-3">
        {/* Page Title */}
        <div>
          <h1 className="text-lg font-bold text-foreground">{pageTitle}</h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-RW", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, products, branches…"
              className="pl-10 bg-muted/40 border-0 rounded-full text-sm focus-visible:ring-1 focus-visible:ring-orange-400"
            />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF6600] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notifOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                      <h3 className="font-bold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {unreadCount} unread
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-[#FF6600] font-semibold hover:underline flex items-center gap-1"
                        >
                          <CheckCheck size={13} /> Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="p-1 hover:bg-muted rounded-full"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const Icon = notificationIcons[notif.type];
                        const colorClass = notificationColors[notif.type];
                        return (
                          <button
                            key={notif.id}
                            onClick={() => markRead(notif.id)}
                            className={cn(
                              "w-full text-left px-5 py-4 flex gap-3 hover:bg-muted/40 transition-colors",
                              !notif.read && "bg-orange-50/60"
                            )}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                colorClass
                              )}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-semibold truncate",
                                  notif.read && "font-medium text-muted-foreground"
                                )}
                              >
                                {notif.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                {notif.time}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-[#FF6600] shrink-0 mt-2" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Avatar with Upload */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative group" aria-label="Profile menu">
                <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-transparent group-hover:ring-orange-400 transition-all">
                  <AvatarImage src={profileImage || undefined} alt={adminName} />
                  <AvatarFallback className="bg-[#FF6600] text-white font-bold text-sm">
                    {getInitials(adminName)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#FF6600] border-2 border-white rounded-full" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-3 border-b border-border">
                <p className="font-semibold text-sm">{adminName}</p>
                <p className="text-xs text-muted-foreground">{adminEmail}</p>
              </div>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer mt-1">
                <Camera className="mr-2 h-4 w-4 text-[#FF6600]" />
                <span>Change Profile Photo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload New Photo</span>
              </DropdownMenuItem>
              {profileImage && (
                <DropdownMenuItem
                  onClick={() => setProfileImage(null)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove Photo
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  Profile Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
}
