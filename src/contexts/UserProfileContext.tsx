"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "payment" | "alert" | "info";
}

interface UserProfileContextType {
  profileImage: string | null;
  setProfileImage: (img: string | null) => void;
  adminName: string;
  setAdminName: (name: string) => void;
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  notifications: Notification[];
  markAllRead: () => void;
  markRead: (id: number) => void;
  addNotification: (n: Omit<Notification, "id" | "read">) => void;
  unreadCount: number;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "New Order Received",
    message: "Branch Kicukiro placed an order for 48 items worth 1,200,000 RWF.",
    time: "2 min ago",
    read: false,
    type: "order",
  },
  {
    id: 2,
    title: "Payment Confirmed",
    message: "MTN MoMo payment of 850,000 RWF from Branch Remera was confirmed.",
    time: "15 min ago",
    read: false,
    type: "payment",
  },
  {
    id: 3,
    title: "Low Stock Alert",
    message: "Inyange Whole Milk 500ml stock is below the minimum threshold (12 units left).",
    time: "1 hr ago",
    read: false,
    type: "alert",
  },
  {
    id: 4,
    title: "Report Ready",
    message: "Monthly sales report for January 2026 is ready to download.",
    time: "3 hrs ago",
    read: true,
    type: "info",
  },
  {
    id: 5,
    title: "New Customer Registered",
    message: "A new wholesale customer account was created: Nyamirambo Grocers.",
    time: "Yesterday",
    read: true,
    type: "info",
  },
];

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("Admin User");
  const [adminEmail, setAdminEmail] = useState("admin@simba.rw");
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const addNotification = (n: Omit<Notification, "id" | "read">) => {
    setNotifications((prev) => [
      { ...n, id: Date.now(), read: false },
      ...prev,
    ]);
  };

  return (
    <UserProfileContext.Provider
      value={{
        profileImage,
        setProfileImage,
        adminName,
        setAdminName,
        adminEmail,
        setAdminEmail,
        notifications,
        markAllRead,
        markRead,
        addNotification,
        unreadCount,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}
