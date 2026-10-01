"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
  id: number;
  title: string;
  message: string;
  time?: string;
  read: boolean;
  type: "sale" | "alert" | "credit" | "stock" | "order" | "payment" | "info";
  actionText?: string;
  actionLink?: string;
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
  dismissNotification: (id: number) => void;
  addNotification: (n: Omit<Notification, "id" | "read">) => void;
  unreadCount: number;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Sale completed successfully",
    message: "7,500 Rwf • 2 items",
    time: "Just now",
    read: false,
    type: "sale",
    actionLink: "/sell-list",
  },
  {
    id: 2,
    title: "Low stock alert",
    message: "2 products are below minimum stock level.",
    actionText: "View Stock",
    actionLink: "/stock",
    time: "15 min ago",
    read: false,
    type: "alert",
  },
  {
    id: 3,
    title: "Credit received",
    message: "5,000 Rwf from Jean Claude",
    time: "45 min ago",
    read: true,
    type: "credit",
    actionLink: "/credit",
  },
  {
    id: 4,
    title: "Stock updated",
    message: "20 units of Primus Beer 500ml",
    time: "2 hrs ago",
    read: true,
    type: "stock",
    actionLink: "/stock",
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

  const dismissNotification = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

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
        dismissNotification,
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
