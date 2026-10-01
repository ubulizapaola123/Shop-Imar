"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  User,
  Product,
  Client,
  Sale,
  SaleLine,
  Purchase,
  PurchaseLine,
  StockMovement,
  CreditPayment,
  Income,
  OutputExpense,
  CaisseMovement,
  AuditLog,
  BackupItem,
  AppSettings,
  UserRole,
} from "@/types/sellpoint";

export interface CartItem {
  productId: string;
  name: string;
  stock: number;
  sellPrice: number;
  costPrice: number;
  quantity: number;
  customPriceAllowed?: boolean;
}

export interface RestockCartItem {
  productId: string;
  name: string;
  currentStock: number;
  quantity: number;
  buyPrice: number;
}

interface SellPointContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  clients: Client[];
  sales: Sale[];
  purchases: Purchase[];
  stockMovements: StockMovement[];
  creditPayments: CreditPayment[];
  incomes: Income[];
  outputs: OutputExpense[];
  caisseMovements: CaisseMovement[];
  auditLogs: AuditLog[];
  backups: BackupItem[];
  settings: AppSettings;
  isHydrated: boolean;

  // Authentication
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };

  // Sales
  processSale: (params: {
    clientName: string;
    items: CartItem[];
    creditAmount: number;
    date?: string;
  }) => { success: boolean; sale?: Sale; error?: string };
  cancelSale: (saleId: string, reason: string) => { success: boolean; error?: string };

  // Restock (Buy)
  processRestock: (params: {
    items: RestockCartItem[];
    supplier?: string;
    date?: string;
  }) => { success: boolean; purchase?: Purchase; error?: string };
  cancelRestock: (purchaseId: string, reason: string) => { success: boolean; error?: string };

  // Products & Stock
  addProduct: (product: Omit<Product, "id" | "archived" | "createdAt">) => { success: boolean; error?: string };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => { success: boolean; error?: string };
  correctStock: (productId: string, newQuantity: number, reason: string) => { success: boolean; error?: string };
  importProducts: (newProducts: Omit<Product, "id" | "archived" | "createdAt">[]) => { success: boolean; count: number };

  // Credit
  makeCreditPayment: (params: {
    saleId: string;
    amount: number;
    note?: string;
  }) => { success: boolean; error?: string };

  // Caisse
  adjustCaisse: (amount: number, reason: string) => { success: boolean; error?: string };
  reconcileCaisse: (countedCash: number, notes?: string) => { difference: number; currentBalance: number };

  // Income & Output
  addIncome: (amount: number, reason: string, date?: string) => { success: boolean; error?: string };
  cancelIncome: (incomeId: string, reason: string) => { success: boolean; error?: string };
  addOutput: (amount: number, reason: string, details: string, date?: string) => { success: boolean; error?: string };
  cancelOutput: (outputId: string, reason: string) => { success: boolean; error?: string };

  // Users Management
  addUser: (userData: Omit<User, "id" | "createdAt">) => { success: boolean; error?: string };
  updateUser: (id: string, updates: Partial<User>) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };

  // Backup & Restore
  createBackup: (label?: string) => BackupItem;
  restoreBackup: (backupId: string) => { success: boolean; error?: string };
  restoreFromData: (jsonData: string) => { success: boolean; error?: string };

  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAllData: () => void;

  // Permissions helper
  hasPermission: (requiredRole: "Admin" | "Manager" | "Cashier") => boolean;
}

const STORAGE_KEY = "sellpoint_db_v1";

const initialUsers: User[] = [
  {
    id: "u-1",
    names: "Admin User",
    username: "admin",
    password: "123",
    role: "Admin",
    active: true,
    createdAt: "2026-01-01",
  },
  {
    id: "u-2",
    names: "Alice Mukamana",
    username: "manager",
    password: "123",
    role: "Manager",
    active: true,
    createdAt: "2026-01-10",
  },
  {
    id: "u-3",
    names: "Jean Claude",
    username: "cashier",
    password: "123",
    role: "Cashier",
    active: true,
    createdAt: "2026-01-15",
  },
];

const initialProducts: Product[] = [
  { id: "p-1", name: "Inyange Fresh Milk 500ml", category: "Dairy", buyPrice: 550, sellPrice: 700, quantity: 24, minStock: 5, archived: false, createdAt: "2026-01-01" },
  { id: "p-2", name: "Inyange Apple Juice 1L", category: "Beverages", buyPrice: 1300, sellPrice: 1600, quantity: 18, minStock: 4, archived: false, createdAt: "2026-01-01" },
  { id: "p-3", name: "Inyange Mineral Water 1.5L", category: "Beverages", buyPrice: 400, sellPrice: 600, quantity: 40, minStock: 10, archived: false, createdAt: "2026-01-01" },
  { id: "p-4", name: "Inyange Strawberry Yoghurt 250ml", category: "Dairy", buyPrice: 500, sellPrice: 700, quantity: 15, minStock: 5, archived: false, createdAt: "2026-01-01" },
  { id: "p-5", name: "Primus Beer 500ml", category: "Alcohol & Beer", buyPrice: 800, sellPrice: 1100, quantity: 32, minStock: 6, archived: false, createdAt: "2026-01-01" },
  { id: "p-6", name: "Mutzig Beer 500ml", category: "Alcohol & Beer", buyPrice: 950, sellPrice: 1300, quantity: 28, minStock: 6, archived: false, createdAt: "2026-01-01" },
  { id: "p-7", name: "Skol Malt 500ml", category: "Alcohol & Beer", buyPrice: 900, sellPrice: 1200, quantity: 20, minStock: 6, archived: false, createdAt: "2026-01-01" },
  { id: "p-8", name: "Skol Lager 500ml", category: "Alcohol & Beer", buyPrice: 850, sellPrice: 1100, quantity: 25, minStock: 6, archived: false, createdAt: "2026-01-01" },
  { id: "p-9", name: "Amstel Malt 330ml", category: "Alcohol & Beer", buyPrice: 900, sellPrice: 1200, quantity: 16, minStock: 5, archived: false, createdAt: "2026-01-01" },
  { id: "p-10", name: "Heineken 330ml", category: "Alcohol & Beer", buyPrice: 1200, sellPrice: 1600, quantity: 14, minStock: 4, archived: false, createdAt: "2026-01-01" },
  { id: "p-11", name: "Coca Cola 300ml Glass", category: "Soft Drinks", buyPrice: 400, sellPrice: 500, quantity: 35, minStock: 10, archived: false, createdAt: "2026-01-01" },
  { id: "p-12", name: "Fanta Citrus 300ml Glass", category: "Soft Drinks", buyPrice: 400, sellPrice: 500, quantity: 30, minStock: 10, archived: false, createdAt: "2026-01-01" },
  { id: "p-13", name: "Sprite 300ml Glass", category: "Soft Drinks", buyPrice: 400, sellPrice: 500, quantity: 22, minStock: 8, archived: false, createdAt: "2026-01-01" },
  { id: "p-14", name: "Red Bull Energy 250ml", category: "Beverages", buyPrice: 1500, sellPrice: 2000, quantity: 12, minStock: 3, archived: false, createdAt: "2026-01-01" },
  { id: "p-15", name: "Minute Maid Tropical 400ml", category: "Beverages", buyPrice: 600, sellPrice: 800, quantity: 18, minStock: 4, archived: false, createdAt: "2026-01-01" },
  { id: "p-16", name: "Kinazi Cassava Flour 5kg", category: "Groceries", buyPrice: 4500, sellPrice: 5500, quantity: 10, minStock: 2, archived: false, createdAt: "2026-01-01" },
  { id: "p-17", name: "Bakhresa Azam Wheat Flour 2kg", category: "Groceries", buyPrice: 2100, sellPrice: 2600, quantity: 15, minStock: 3, archived: false, createdAt: "2026-01-01" },
  { id: "p-18", name: "Rice Basmati Super 5kg", category: "Groceries", buyPrice: 7500, sellPrice: 9200, quantity: 8, minStock: 2, archived: false, createdAt: "2026-01-01" },
  { id: "p-19", name: "Rice Pakistani 25kg", category: "Groceries", buyPrice: 28000, sellPrice: 33000, quantity: 4, minStock: 2, archived: false, createdAt: "2026-01-01" },
  { id: "p-20", name: "Sugar Kabuye 1kg", category: "Groceries", buyPrice: 1200, sellPrice: 1500, quantity: 3, minStock: 5, archived: false, createdAt: "2026-01-01" }, // Low stock!
  { id: "p-21", name: "Sunflower Cooking Oil 1L", category: "Groceries", buyPrice: 2400, sellPrice: 3000, quantity: 14, minStock: 3, archived: false, createdAt: "2026-01-01" },
  { id: "p-22", name: "Olive Oil Filippo Berio 500ml", category: "Groceries", buyPrice: 6500, sellPrice: 8500, quantity: 5, minStock: 2, archived: false, createdAt: "2026-01-01" },
  { id: "p-23", name: "Rwanda Table Salt 1kg", category: "Groceries", buyPrice: 350, sellPrice: 500, quantity: 50, minStock: 10, archived: false, createdAt: "2026-01-01" },
  { id: "p-24", name: "Blue Band Margarine 500g", category: "Groceries", buyPrice: 1800, sellPrice: 2400, quantity: 12, minStock: 3, archived: false, createdAt: "2026-01-01" },
  { id: "p-25", name: "Brookside Butter 250g", category: "Dairy", buyPrice: 2600, sellPrice: 3300, quantity: 6, minStock: 2, archived: false, createdAt: "2026-01-01" },
  { id: "p-26", name: "Cowbell Milk Powder 400g", category: "Dairy", buyPrice: 2800, sellPrice: 3600, quantity: 9, minStock: 2, archived: false, createdAt: "2026-01-01" },
  { id: "p-27", name: "Nescafe Classic 100g", category: "Beverages", buyPrice: 3800, sellPrice: 4800, quantity: 7, minStock: 2, archived: false, createdAt: "2026-01-01" },
  { id: "p-28", name: "Geisha Soap 225g", category: "Hygiene", buyPrice: 700, sellPrice: 1000, quantity: 22, minStock: 5, archived: false, createdAt: "2026-01-01" },
  { id: "p-29", name: "Omo Hand Wash Detergent 1kg", category: "Cleaning", buyPrice: 2200, sellPrice: 2800, quantity: 11, minStock: 3, archived: false, createdAt: "2026-01-01" },
  { id: "p-30", name: "Colgate Herbal 140g", category: "Hygiene", buyPrice: 1200, sellPrice: 1700, quantity: 2, minStock: 5, archived: false, createdAt: "2026-01-01" }, // Low stock!
  { id: "p-31", name: "Bella Paper Napkins Pack", category: "Cleaning", buyPrice: 600, sellPrice: 900, quantity: 30, minStock: 5, archived: false, createdAt: "2026-01-01" },
];

const initialClients: Client[] = [
  { id: "c-1", name: "Nkurunziza Patrick", phone: "+250 788 111 222", totalDebt: 15000, createdAt: "2026-01-02" },
  { id: "c-2", name: "Uwase Jeannette", phone: "+250 785 333 444", totalDebt: 8500, createdAt: "2026-01-05" },
  { id: "c-3", name: "Kamanzi Eric", phone: "+250 782 555 666", totalDebt: 0, createdAt: "2026-01-10" },
  { id: "c-4", name: "Mutesi Solange", phone: "+250 789 777 888", totalDebt: 22000, createdAt: "2026-01-12" },
];

const todayStr = new Date().toISOString().split("T")[0];

const initialSales: Sale[] = [
  {
    id: "s-1001",
    saleNumber: "SAL-2026-0001",
    date: todayStr,
    clientId: "c-1",
    clientName: "Nkurunziza Patrick",
    operatorId: "u-1",
    operatorName: "Admin User",
    total: 35000,
    paidAmount: 20000,
    creditAmount: 15000,
    status: "completed",
    lines: [
      { id: "sl-1", saleId: "s-1001", productId: "p-19", productName: "Rice Pakistani 25kg", quantity: 1, sellPrice: 33000, costPrice: 28000, lineTotal: 33000 },
      { id: "sl-2", saleId: "s-1001", productId: "p-14", productName: "Red Bull Energy 250ml", quantity: 1, sellPrice: 2000, costPrice: 1500, lineTotal: 2000 },
    ],
  },
  {
    id: "s-1002",
    saleNumber: "SAL-2026-0002",
    date: todayStr,
    clientName: "Uwase Jeannette",
    clientId: "c-2",
    operatorId: "u-3",
    operatorName: "Jean Claude",
    total: 8500,
    paidAmount: 0,
    creditAmount: 8500,
    status: "completed",
    lines: [
      { id: "sl-3", saleId: "s-1002", productId: "p-22", productName: "Olive Oil Filippo Berio 500ml", quantity: 1, sellPrice: 8500, costPrice: 6500, lineTotal: 8500 },
    ],
  },
  {
    id: "s-1003",
    saleNumber: "SAL-2026-0003",
    date: todayStr,
    clientName: "Unknown Client",
    operatorId: "u-3",
    operatorName: "Jean Claude",
    total: 12500,
    paidAmount: 12500,
    creditAmount: 0,
    status: "completed",
    lines: [
      { id: "sl-4", saleId: "s-1003", productId: "p-16", productName: "Kinazi Cassava Flour 5kg", quantity: 2, sellPrice: 5500, costPrice: 4500, lineTotal: 11000 },
      { id: "sl-5", saleId: "s-1003", productId: "p-20", productName: "Sugar Kabuye 1kg", quantity: 1, sellPrice: 1500, costPrice: 1200, lineTotal: 1500 },
    ],
  },
];

const initialStockMovements: StockMovement[] = [
  { id: "sm-1", date: todayStr, productId: "p-19", productName: "Rice Pakistani 25kg", type: "sale", quantityChange: -1, previousStock: 5, newStock: 4, reason: "Sale SAL-2026-0001", operatorName: "Admin User" },
  { id: "sm-2", date: todayStr, productId: "p-14", productName: "Red Bull Energy 250ml", type: "sale", quantityChange: -1, previousStock: 13, newStock: 12, reason: "Sale SAL-2026-0001", operatorName: "Admin User" },
  { id: "sm-3", date: todayStr, productId: "p-22", productName: "Olive Oil Filippo Berio 500ml", type: "sale", quantityChange: -1, previousStock: 6, newStock: 5, reason: "Sale SAL-2026-0002", operatorName: "Jean Claude" },
  { id: "sm-4", date: todayStr, productId: "p-16", productName: "Kinazi Cassava Flour 5kg", type: "sale", quantityChange: -2, previousStock: 12, newStock: 10, reason: "Sale SAL-2026-0003", operatorName: "Jean Claude" },
  { id: "sm-5", date: todayStr, productId: "p-20", productName: "Sugar Kabuye 1kg", type: "sale", quantityChange: -1, previousStock: 4, newStock: 3, reason: "Sale SAL-2026-0003", operatorName: "Jean Claude" },
];

const initialPurchases: Purchase[] = [
  {
    id: "pur-1",
    purchaseNumber: "RESTOCK-001",
    date: todayStr,
    supplier: "Inyange Industries Ltd",
    total: 45000,
    operatorId: "u-1",
    operatorName: "Admin User",
    status: "completed",
    lines: [
      { id: "pl-1", purchaseId: "pur-1", productId: "p-1", productName: "Inyange Fresh Milk 500ml", quantity: 30, buyPrice: 550, lineTotal: 16500 },
      { id: "pl-2", purchaseId: "pur-1", productId: "p-2", productName: "Inyange Apple Juice 1L", quantity: 15, buyPrice: 1300, lineTotal: 19500 },
      { id: "pl-3", purchaseId: "pur-1", productId: "p-3", productName: "Inyange Mineral Water 1.5L", quantity: 22, buyPrice: 400, lineTotal: 9000 },
    ],
  },
];

const initialCreditPayments: CreditPayment[] = [
  { id: "cp-1", saleId: "s-1001", clientId: "c-1", clientName: "Nkurunziza Patrick", amount: 5000, paymentDate: todayStr, operatorId: "u-3", operatorName: "Jean Claude", note: "Cash instalment" },
];

const initialIncomes: Income[] = [
  { id: "inc-1", date: todayStr, operatorId: "u-1", operatorName: "Admin User", amount: 15000, reason: "Empty beer crates return deposit refund", status: "active" },
];

const initialOutputs: OutputExpense[] = [
  { id: "out-1", date: todayStr, operatorId: "u-1", operatorName: "Admin User", amount: 4500, reason: "Transport", details: "Moto delivery transport for stock", status: "active" },
  { id: "out-2", date: todayStr, operatorId: "u-2", operatorName: "Alice Mukamana", amount: 3000, reason: "Other", details: "Cleaning soap and dust cloths for counter", status: "active" },
];

const initialCaisseMovements: CaisseMovement[] = [
  { id: "cm-0", date: todayStr, operatorName: "Admin User", type: "opening_balance", amount: 250000, previousBalance: 0, newBalance: 250000, reason: "Day opening cash" },
  { id: "cm-1", date: todayStr, operatorName: "Admin User", type: "sale_cash", amount: 20000, previousBalance: 250000, newBalance: 270000, reason: "Sale SAL-2026-0001 cash portion" },
  { id: "cm-2", date: todayStr, operatorName: "Jean Claude", type: "sale_cash", amount: 12500, previousBalance: 270000, newBalance: 282500, reason: "Sale SAL-2026-0003" },
  { id: "cm-3", date: todayStr, operatorName: "Jean Claude", type: "credit_payment", amount: 5000, previousBalance: 282500, newBalance: 287500, reason: "Credit payment from Nkurunziza Patrick" },
  { id: "cm-4", date: todayStr, operatorName: "Admin User", type: "income", amount: 15000, previousBalance: 287500, newBalance: 302500, reason: "Empty beer crates return deposit" },
  { id: "cm-5", date: todayStr, operatorName: "Admin User", type: "output", amount: -4500, previousBalance: 302500, newBalance: 298000, reason: "Transport" },
  { id: "cm-6", date: todayStr, operatorName: "Alice Mukamana", type: "output", amount: -3000, previousBalance: 298000, newBalance: 295000, reason: "Cleaning supplies" },
];

const initialSettings: AppSettings = {
  shopName: "Sell Point",
  address: "Kigali, Nyarugenge Market, Shop #42, Rwanda",
  phone: "+250 788 450 120",
  tin: "100234567",
  receiptHeader: "SELL POINT GUICHET #1\nNyarugenge Market - Kigali\nTIN: 100234567 | Tel: +250 788 450 120",
  receiptFooter: "Murakoze cyane! / Merci pour votre visite!\nGoods once sold are not returnable without receipt.",
  printer: "Thermal 80mm ESC/POS",
  language: "English",
  outputReasons: ["Payment", "Rent", "Transport", "Salary", "Supplier payment", "Other"],
  allowNegativeStock: false,
  allowBackdatedSales: true,
  caisseBalance: 295000,
};

const initialBackups: BackupItem[] = [
  {
    id: "bk-1",
    filename: "sellpoint_auto_backup_2026-01-30.json",
    date: "2026-01-30 20:00:00",
    sizeKb: 42,
    data: "{}",
  },
];

const SellPointContext = createContext<SellPointContextType | undefined>(undefined);

export function SellPointProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]); // Default to Admin
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [creditPayments, setCreditPayments] = useState<CreditPayment[]>(initialCreditPayments);
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [outputs, setOutputs] = useState<OutputExpense[]>(initialOutputs);
  const [caisseMovements, setCaisseMovements] = useState<CaisseMovement[]>(initialCaisseMovements);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>(initialBackups);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from LocalStorage once mounted
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.purchases) setPurchases(parsed.purchases);
        if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
        if (parsed.creditPayments) setCreditPayments(parsed.creditPayments);
        if (parsed.incomes) setIncomes(parsed.incomes);
        if (parsed.outputs) setOutputs(parsed.outputs);
        if (parsed.caisseMovements) setCaisseMovements(parsed.caisseMovements);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.backups) setBackups(parsed.backups);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.currentUserId) {
          const found = (parsed.users || initialUsers).find((u: User) => u.id === parsed.currentUserId);
          if (found) setCurrentUser(found);
        }
      }
    } catch (e) {
      console.error("Failed to load SellPoint store from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const payload = {
        users,
        products,
        clients,
        sales,
        purchases,
        stockMovements,
        creditPayments,
        incomes,
        outputs,
        caisseMovements,
        auditLogs,
        backups,
        settings,
        currentUserId: currentUser?.id,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to persist SellPoint store", e);
    }
  }, [
    users,
    products,
    clients,
    sales,
    purchases,
    stockMovements,
    creditPayments,
    incomes,
    outputs,
    caisseMovements,
    auditLogs,
    backups,
    settings,
    currentUser,
    isHydrated,
  ]);

  const logAudit = (action: string, details: string) => {
    const entry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operatorName: currentUser?.names || "System",
      action,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const hasPermission = (requiredRole: "Admin" | "Manager" | "Cashier"): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "Admin") return true;
    if (requiredRole === "Manager" && currentUser.role === "Manager") return true;
    if (requiredRole === "Cashier") return true;
    return false;
  };

  // Auth
  const login = (username: string, password: string) => {
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase().trim());
    if (!user) return { success: false, error: "User not found" };
    if (!user.active) return { success: false, error: "User account is deactivated" };
    if (user.password !== password) return { success: false, error: "Incorrect password" };

    setCurrentUser(user);
    logAudit("LOGIN", `User ${user.username} logged in with role ${user.role}`);
    return { success: true };
  };

  const logout = () => {
    logAudit("LOGOUT", `User ${currentUser?.username || "unknown"} logged out`);
    setCurrentUser(null);
  };

  const switchUserRole = (role: UserRole) => {
    const existing = users.find((u) => u.role === role);
    if (existing) {
      setCurrentUser(existing);
      logAudit("ROLE_SWITCH", `Switched active user to ${existing.names} (${role})`);
    }
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (currentUser.password !== oldPass) return { success: false, error: "Current password does not match" };
    if (newPass.length < 3) return { success: false, error: "Password must be at least 3 characters" };

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, password: newPass } : u))
    );
    setCurrentUser((prev) => (prev ? { ...prev, password: newPass } : null));
    logAudit("PASSWORD_CHANGE", `User ${currentUser.username} changed their password`);
    return { success: true };
  };

  // Sale logic
  const processSale = ({
    clientName,
    items,
    creditAmount,
    date = todayStr,
  }: {
    clientName: string;
    items: CartItem[];
    creditAmount: number;
    date?: string;
  }) => {
    if (!currentUser) return { success: false, error: "Must be logged in to sell" };
    if (items.length === 0) return { success: false, error: "Cart is empty" };

    // Validate stock for all items
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return { success: false, error: `Product ${item.name} not found` };
      if (!settings.allowNegativeStock && prod.quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.name}. Available: ${prod.quantity}, Requested: ${item.quantity}`,
        };
      }
    }

    const saleTotal = items.reduce((acc, it) => acc + it.sellPrice * it.quantity, 0);
    if (creditAmount > saleTotal) {
      return { success: false, error: "Credit amount cannot exceed total sale amount" };
    }
    if (creditAmount > 0 && (!clientName || clientName.trim().toLowerCase() === "unknown client")) {
      return { success: false, error: "Credit sales require a valid client name" };
    }

    const cashReceived = saleTotal - creditAmount;
    const saleId = `sal-${Date.now()}`;
    const saleNum = `SAL-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, "0")}`;

    const lines: SaleLine[] = items.map((it, idx) => ({
      id: `sl-${Date.now()}-${idx}`,
      saleId,
      productId: it.productId,
      productName: it.name,
      quantity: it.quantity,
      sellPrice: it.sellPrice,
      costPrice: it.costPrice,
      lineTotal: it.sellPrice * it.quantity,
    }));

    // Find or create client
    let resolvedClientId = undefined;
    if (clientName && clientName.trim().toLowerCase() !== "unknown client") {
      const existingClient = clients.find(
        (c) => c.name.toLowerCase().trim() === clientName.toLowerCase().trim()
      );
      if (existingClient) {
        resolvedClientId = existingClient.id;
        if (creditAmount > 0) {
          setClients((prev) =>
            prev.map((c) =>
              c.id === existingClient.id ? { ...c, totalDebt: c.totalDebt + creditAmount } : c
            )
          );
        }
      } else {
        const newCId = `c-${Date.now()}`;
        resolvedClientId = newCId;
        const newClient: Client = {
          id: newCId,
          name: clientName.trim(),
          phone: "",
          totalDebt: creditAmount,
          createdAt: date,
        };
        setClients((prev) => [newClient, ...prev]);
      }
    }

    const newSale: Sale = {
      id: saleId,
      saleNumber: saleNum,
      date,
      clientId: resolvedClientId,
      clientName: clientName.trim() || "Unknown Client",
      operatorId: currentUser.id,
      operatorName: currentUser.names,
      total: saleTotal,
      paidAmount: cashReceived,
      creditAmount,
      status: "completed",
      lines,
    };

    // Atomic updates: Stock reduction and stock movement creation
    const newStockMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const cartItem = items.find((it) => it.productId === prod.id);
      if (cartItem) {
        const newQty = prod.quantity - cartItem.quantity;
        newStockMovements.push({
          id: `sm-${Date.now()}-${prod.id}`,
          date,
          productId: prod.id,
          productName: prod.name,
          type: "sale",
          quantityChange: -cartItem.quantity,
          previousStock: prod.quantity,
          newStock: newQty,
          reason: `Sale ${saleNum}`,
          operatorName: currentUser.names,
        });
        return { ...prod, quantity: newQty };
      }
      return prod;
    });

    // Caisse update if cash received
    let updatedCaisseBalance = settings.caisseBalance;
    if (cashReceived > 0) {
      updatedCaisseBalance += cashReceived;
      const caisseEntry: CaisseMovement = {
        id: `cm-${Date.now()}`,
        date,
        operatorName: currentUser.names,
        type: "sale_cash",
        amount: cashReceived,
        previousBalance: settings.caisseBalance,
        newBalance: updatedCaisseBalance,
        reason: `Sale ${saleNum} cash received`,
      };
      setCaisseMovements((prev) => [caisseEntry, ...prev]);
    }

    setProducts(updatedProducts);
    setStockMovements((prev) => [...newStockMovements, ...prev]);
    setSales((prev) => [newSale, ...prev]);
    setSettings((prev) => ({ ...prev, caisseBalance: updatedCaisseBalance }));

    logAudit(
      "SALE_CREATED",
      `Sale ${saleNum} of ${saleTotal} Rwf created by ${currentUser.names}. Cash: ${cashReceived} Rwf, Credit: ${creditAmount} Rwf`
    );

    return { success: true, sale: newSale };
  };

  // Cancel sale
  const cancelSale = (saleId: string, reason: string) => {
    if (!currentUser) return { success: false, error: "Must be logged in" };
    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "Reason for sale cancellation is mandatory" };
    }

    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return { success: false, error: "Sale not found" };
    if (sale.status === "cancelled") return { success: false, error: "Sale is already cancelled" };

    // Check permission: only seller or Admin
    if (currentUser.role !== "Admin" && currentUser.id !== sale.operatorId) {
      return { success: false, error: "Only the seller or an Admin can cancel this sale" };
    }

    // Revert stock atomically
    const reversalMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const line = sale.lines.find((l) => l.productId === prod.id);
      if (line) {
        const newQty = prod.quantity + line.quantity;
        reversalMovements.push({
          id: `sm-${Date.now()}-${prod.id}`,
          date: todayStr,
          productId: prod.id,
          productName: prod.name,
          type: "cancel_sale",
          quantityChange: line.quantity,
          previousStock: prod.quantity,
          newStock: newQty,
          reason: `Cancel Sale ${sale.saleNumber}: ${reason}`,
          operatorName: currentUser.names,
        });
        return { ...prod, quantity: newQty };
      }
      return prod;
    });

    // Revert cash in caisse if paidAmount > 0
    let updatedCaisse = settings.caisseBalance;
    if (sale.paidAmount > 0) {
      updatedCaisse -= sale.paidAmount;
      const caisseEntry: CaisseMovement = {
        id: `cm-${Date.now()}`,
        date: todayStr,
        operatorName: currentUser.names,
        type: "cancel_sale",
        amount: -sale.paidAmount,
        previousBalance: settings.caisseBalance,
        newBalance: updatedCaisse,
        reason: `Reversed Sale ${sale.saleNumber} (${reason})`,
      };
      setCaisseMovements((prev) => [caisseEntry, ...prev]);
    }

    // Revert debt if client had credit
    if (sale.creditAmount > 0 && sale.clientId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === sale.clientId
            ? { ...c, totalDebt: Math.max(0, c.totalDebt - sale.creditAmount) }
            : c
        )
      );
    }

    // Mark sale as cancelled
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? {
              ...s,
              status: "cancelled",
              cancelReason: reason,
              cancelledBy: currentUser.names,
              cancelledAt: new Date().toISOString(),
            }
          : s
      )
    );

    setProducts(updatedProducts);
    setStockMovements((prev) => [...reversalMovements, ...prev]);
    setSettings((prev) => ({ ...prev, caisseBalance: updatedCaisse }));

    logAudit(
      "SALE_CANCELLED",
      `Sale ${sale.saleNumber} cancelled by ${currentUser.names}. Reason: ${reason}`
    );

    return { success: true };
  };

  // Restock (Buy)
  const processRestock = ({
    items,
    supplier,
    date = todayStr,
  }: {
    items: RestockCartItem[];
    supplier?: string;
    date?: string;
  }) => {
    if (!currentUser) return { success: false, error: "Must be logged in" };
    if (!hasPermission("Manager")) {
      return { success: false, error: "Cashiers cannot perform restock operations" };
    }
    if (items.length === 0) return { success: false, error: "Restock cart is empty" };

    const totalCost = items.reduce((acc, it) => acc + it.buyPrice * it.quantity, 0);
    const purchaseId = `pur-${Date.now()}`;
    const purchaseNum = `RESTOCK-${String(purchases.length + 1).padStart(4, "0")}`;

    const lines: PurchaseLine[] = items.map((it, idx) => ({
      id: `pl-${Date.now()}-${idx}`,
      purchaseId,
      productId: it.productId,
      productName: it.name,
      quantity: it.quantity,
      buyPrice: it.buyPrice,
      lineTotal: it.buyPrice * it.quantity,
    }));

    const newPurchase: Purchase = {
      id: purchaseId,
      purchaseNumber: purchaseNum,
      date,
      supplier: supplier?.trim() || undefined,
      total: totalCost,
      operatorId: currentUser.id,
      operatorName: currentUser.names,
      status: "completed",
      lines,
    };

    const newMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const restockItem = items.find((it) => it.productId === prod.id);
      if (restockItem) {
        const newQty = prod.quantity + restockItem.quantity;
        newMovements.push({
          id: `sm-${Date.now()}-${prod.id}`,
          date,
          productId: prod.id,
          productName: prod.name,
          type: "purchase",
          quantityChange: restockItem.quantity,
          previousStock: prod.quantity,
          newStock: newQty,
          reason: `Restock ${purchaseNum} (${supplier || "Direct"})`,
          operatorName: currentUser.names,
        });
        return {
          ...prod,
          quantity: newQty,
          buyPrice: restockItem.buyPrice, // Update latest buying price
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    setStockMovements((prev) => [...newMovements, ...prev]);
    setPurchases((prev) => [newPurchase, ...prev]);

    logAudit(
      "RESTOCK_COMPLETED",
      `Restock ${purchaseNum} of ${totalCost} Rwf saved by ${currentUser.names}`
    );

    return { success: true, purchase: newPurchase };
  };

  // Cancel Restock
  const cancelRestock = (purchaseId: string, reason: string) => {
    if (!currentUser) return { success: false, error: "Must be logged in" };
    if (!hasPermission("Manager")) return { success: false, error: "Permission denied" };
    if (!reason || reason.trim().length === 0) return { success: false, error: "Reason is required" };

    const purchase = purchases.find((p) => p.id === purchaseId);
    if (!purchase) return { success: false, error: "Restock record not found" };
    if (purchase.status === "cancelled") return { success: false, error: "Already cancelled" };

    // Check if cancellation would cause negative stock
    for (const line of purchase.lines) {
      const prod = products.find((p) => p.id === line.productId);
      if (prod && prod.quantity < line.quantity) {
        return {
          success: false,
          error: `Cannot cancel restock: product ${prod.name} has only ${prod.quantity} in stock (requires ${line.quantity}). Cancelling would cause negative stock.`,
        };
      }
    }

    const reversalMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const line = purchase.lines.find((l) => l.productId === prod.id);
      if (line) {
        const newQty = prod.quantity - line.quantity;
        reversalMovements.push({
          id: `sm-${Date.now()}-${prod.id}`,
          date: todayStr,
          productId: prod.id,
          productName: prod.name,
          type: "cancel_purchase",
          quantityChange: -line.quantity,
          previousStock: prod.quantity,
          newStock: newQty,
          reason: `Cancel Restock ${purchase.purchaseNumber}: ${reason}`,
          operatorName: currentUser.names,
        });
        return { ...prod, quantity: newQty };
      }
      return prod;
    });

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              status: "cancelled",
              cancelReason: reason,
              cancelledAt: new Date().toISOString(),
            }
          : p
      )
    );

    setProducts(updatedProducts);
    setStockMovements((prev) => [...reversalMovements, ...prev]);

    logAudit("RESTOCK_CANCELLED", `Restock ${purchase.purchaseNumber} cancelled: ${reason}`);
    return { success: true };
  };

  // Products
  const addProduct = (prodData: Omit<Product, "id" | "archived" | "createdAt">) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (!hasPermission("Manager")) return { success: false, error: "Permission denied" };
    if (!prodData.name.trim()) return { success: false, error: "Product name is required" };
    if (prodData.sellPrice < 0 || prodData.buyPrice < 0) {
      return { success: false, error: "Prices cannot be negative" };
    }

    const newProd: Product = {
      ...prodData,
      id: `p-${Date.now()}`,
      archived: false,
      createdAt: todayStr,
    };

    setProducts((prev) => [newProd, ...prev]);
    logAudit("PRODUCT_ADDED", `Product ${newProd.name} added by ${currentUser.names}`);
    return { success: true };
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (!hasPermission("Manager")) return { success: false, error: "Permission denied" };

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    logAudit("PRODUCT_UPDATED", `Product ${id} updated by ${currentUser.names}`);
    return { success: true };
  };

  const deleteProduct = (id: string) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (!hasPermission("Admin")) return { success: false, error: "Only Admins can delete products" };

    const hasSales = sales.some((s) => s.lines.some((l) => l.productId === id));
    const hasPurchases = purchases.some((p) => p.lines.some((l) => l.productId === id));

    if (hasSales || hasPurchases) {
      // Archive instead of hard-delete to protect data integrity
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, archived: true } : p))
      );
      logAudit("PRODUCT_ARCHIVED", `Product ${id} archived due to transaction history`);
      return { success: true };
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAudit("PRODUCT_DELETED", `Product ${id} permanently removed`);
    return { success: true };
  };

  const correctStock = (productId: string, newQuantity: number, reason: string) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (!hasPermission("Manager")) return { success: false, error: "Permission denied" };
    if (!reason || !reason.trim()) return { success: false, error: "Correction reason is mandatory" };
    if (newQuantity < 0 && !settings.allowNegativeStock) {
      return { success: false, error: "Stock cannot be negative" };
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return { success: false, error: "Product not found" };

    const diff = newQuantity - prod.quantity;
    if (diff === 0) return { success: false, error: "New quantity is identical to existing quantity" };

    const movement: StockMovement = {
      id: `sm-${Date.now()}-${productId}`,
      date: todayStr,
      productId: prod.id,
      productName: prod.name,
      type: "correction",
      quantityChange: diff,
      previousStock: prod.quantity,
      newStock: newQuantity,
      reason,
      operatorName: currentUser.names,
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQuantity } : p))
    );
    setStockMovements((prev) => [movement, ...prev]);

    logAudit("STOCK_CORRECTED", `Stock for ${prod.name} corrected from ${prod.quantity} to ${newQuantity}. Reason: ${reason}`);
    return { success: true };
  };

  const importProducts = (newProducts: Omit<Product, "id" | "archived" | "createdAt">[]) => {
    let count = 0;
    const added: Product[] = [];
    newProducts.forEach((p, idx) => {
      if (p.name && p.sellPrice > 0) {
        added.push({
          ...p,
          id: `p-${Date.now()}-${idx}`,
          archived: false,
          createdAt: todayStr,
        });
        count++;
      }
    });

    setProducts((prev) => [...added, ...prev]);
    logAudit("PRODUCTS_IMPORTED", `${count} products imported from CSV/Excel`);
    return { success: true, count };
  };

  // Credit payments
  const makeCreditPayment = ({
    saleId,
    amount,
    note,
  }: {
    saleId: string;
    amount: number;
    note?: string;
  }) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (amount <= 0) return { success: false, error: "Payment amount must be greater than 0" };

    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return { success: false, error: "Sale not found" };

    // Calculate current remaining debt for this sale
    const priorPayments = creditPayments
      .filter((cp) => cp.saleId === saleId)
      .reduce((acc, cp) => acc + cp.amount, 0);
    const balanceOwed = sale.creditAmount - priorPayments;

    if (amount > balanceOwed) {
      return {
        success: false,
        error: `Payment amount (${amount} Rwf) cannot exceed outstanding debt (${balanceOwed} Rwf)`,
      };
    }

    const payment: CreditPayment = {
      id: `cp-${Date.now()}`,
      saleId,
      clientId: sale.clientId || "",
      clientName: sale.clientName,
      amount,
      paymentDate: todayStr,
      operatorId: currentUser.id,
      operatorName: currentUser.names,
      note,
    };

    // Update client total debt
    if (sale.clientId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === sale.clientId ? { ...c, totalDebt: Math.max(0, c.totalDebt - amount) } : c
        )
      );
    }

    // Add cash into Caisse
    const updatedCaisse = settings.caisseBalance + amount;
    const caisseMovement: CaisseMovement = {
      id: `cm-${Date.now()}`,
      date: todayStr,
      operatorName: currentUser.names,
      type: "credit_payment",
      amount,
      previousBalance: settings.caisseBalance,
      newBalance: updatedCaisse,
      reason: `Credit payment from ${sale.clientName} for ${sale.saleNumber}`,
    };

    setCreditPayments((prev) => [payment, ...prev]);
    setCaisseMovements((prev) => [caisseMovement, ...prev]);
    setSettings((prev) => ({ ...prev, caisseBalance: updatedCaisse }));

    logAudit("CREDIT_PAYMENT", `Received ${amount} Rwf credit payment from ${sale.clientName}`);
    return { success: true };
  };

  // Caisse manual adjustments
  const adjustCaisse = (amount: number, reason: string) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (!reason || !reason.trim()) return { success: false, error: "Adjustment reason is mandatory" };
    if (amount < 0 && currentUser.role !== "Admin") {
      return { success: false, error: "Negative caisse corrections are Admin only" };
    }

    const newBalance = settings.caisseBalance + amount;
    if (newBalance < 0) {
      return { success: false, error: "Caisse balance cannot become negative" };
    }

    const movement: CaisseMovement = {
      id: `cm-${Date.now()}`,
      date: todayStr,
      operatorName: currentUser.names,
      type: "manual_update",
      amount,
      previousBalance: settings.caisseBalance,
      newBalance,
      reason,
    };

    setCaisseMovements((prev) => [movement, ...prev]);
    setSettings((prev) => ({ ...prev, caisseBalance: newBalance }));

    logAudit("CAISSE_ADJUSTED", `Caisse adjusted by ${amount} Rwf (${reason}). New balance: ${newBalance} Rwf`);
    return { success: true };
  };

  const reconcileCaisse = (countedCash: number, notes?: string) => {
    const currentBalance = settings.caisseBalance;
    const difference = countedCash - currentBalance;

    const movement: CaisseMovement = {
      id: `cm-${Date.now()}`,
      date: todayStr,
      operatorName: currentUser?.names || "Cashier",
      type: "end_of_day",
      amount: 0,
      previousBalance: currentBalance,
      newBalance: countedCash,
      reason: `End of day reconciliation: Counted ${countedCash} Rwf, Expected ${currentBalance} Rwf (Diff: ${difference} Rwf). ${notes || ""}`,
    };

    setCaisseMovements((prev) => [movement, ...prev]);
    logAudit(
      "CAISSE_RECONCILED",
      `End-of-day count: Counted ${countedCash} Rwf, Diff: ${difference} Rwf`
    );

    return { difference, currentBalance };
  };

  // Income
  const addIncome = (amount: number, reason: string, date = todayStr) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (amount <= 0) return { success: false, error: "Income amount must be greater than 0" };
    if (!reason.trim()) return { success: false, error: "Income reason is mandatory" };

    const incomeId = `inc-${Date.now()}`;
    const newIncome: Income = {
      id: incomeId,
      date,
      operatorId: currentUser.id,
      operatorName: currentUser.names,
      amount,
      reason: reason.trim(),
      status: "active",
    };

    const newCaisse = settings.caisseBalance + amount;
    const caisseEntry: CaisseMovement = {
      id: `cm-${Date.now()}`,
      date,
      operatorName: currentUser.names,
      type: "income",
      amount,
      previousBalance: settings.caisseBalance,
      newBalance: newCaisse,
      reason: `Income: ${reason}`,
    };

    setIncomes((prev) => [newIncome, ...prev]);
    setCaisseMovements((prev) => [caisseEntry, ...prev]);
    setSettings((prev) => ({ ...prev, caisseBalance: newCaisse }));

    logAudit("INCOME_ADDED", `Income of ${amount} Rwf recorded: ${reason}`);
    return { success: true };
  };

  const cancelIncome = (incomeId: string, reason: string) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (!hasPermission("Manager")) return { success: false, error: "Permission denied" };
    if (!reason.trim()) return { success: false, error: "Reason is required to void income" };

    const inc = incomes.find((i) => i.id === incomeId);
    if (!inc) return { success: false, error: "Income not found" };
    if (inc.status === "cancelled") return { success: false, error: "Already cancelled" };

    const newCaisse = settings.caisseBalance - inc.amount;
    const caisseEntry: CaisseMovement = {
      id: `cm-${Date.now()}`,
      date: todayStr,
      operatorName: currentUser.names,
      type: "cancel_income",
      amount: -inc.amount,
      previousBalance: settings.caisseBalance,
      newBalance: newCaisse,
      reason: `Void income ${inc.reason} (${reason})`,
    };

    setIncomes((prev) =>
      prev.map((i) =>
        i.id === incomeId
          ? {
              ...i,
              status: "cancelled",
              cancelReason: reason,
              cancelledAt: new Date().toISOString(),
            }
          : i
      )
    );
    setCaisseMovements((prev) => [caisseEntry, ...prev]);
    setSettings((prev) => ({ ...prev, caisseBalance: newCaisse }));

    logAudit("INCOME_VOIDED", `Income ID ${incomeId} voided: ${reason}`);
    return { success: true };
  };

  // Outputs (Expenses)
  const addOutput = (amount: number, reason: string, details: string, date = todayStr) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (amount <= 0) return { success: false, error: "Expense amount must be greater than 0" };
    if (!reason) return { success: false, error: "Reason category is mandatory" };

    // Acceptance rule: Warn if amount > cash in Caisse
    if (amount > settings.caisseBalance) {
      return {
        success: false,
        error: `Insufficient cash in Caisse (${settings.caisseBalance} Rwf) to pay ${amount} Rwf expense`,
      };
    }

    const outputId = `out-${Date.now()}`;
    const newOutput: OutputExpense = {
      id: outputId,
      date,
      operatorId: currentUser.id,
      operatorName: currentUser.names,
      amount,
      reason,
      details: details.trim(),
      status: "active",
    };

    const newCaisse = settings.caisseBalance - amount;
    const caisseEntry: CaisseMovement = {
      id: `cm-${Date.now()}`,
      date,
      operatorName: currentUser.names,
      type: "output",
      amount: -amount,
      previousBalance: settings.caisseBalance,
      newBalance: newCaisse,
      reason: `Expense [${reason}]: ${details || "No details"}`,
    };

    setOutputs((prev) => [newOutput, ...prev]);
    setCaisseMovements((prev) => [caisseEntry, ...prev]);
    setSettings((prev) => ({ ...prev, caisseBalance: newCaisse }));

    logAudit("EXPENSE_ADDED", `Expense of ${amount} Rwf [${reason}] recorded: ${details}`);
    return { success: true };
  };

  const cancelOutput = (outputId: string, reason: string) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (!hasPermission("Manager")) return { success: false, error: "Permission denied" };
    if (!reason.trim()) return { success: false, error: "Reason is required to cancel expense" };

    const out = outputs.find((o) => o.id === outputId);
    if (!out) return { success: false, error: "Expense record not found" };
    if (out.status === "cancelled") return { success: false, error: "Already cancelled" };

    const newCaisse = settings.caisseBalance + out.amount;
    const caisseEntry: CaisseMovement = {
      id: `cm-${Date.now()}`,
      date: todayStr,
      operatorName: currentUser.names,
      type: "cancel_output",
      amount: out.amount,
      previousBalance: settings.caisseBalance,
      newBalance: newCaisse,
      reason: `Cancelled expense [${out.reason}]: ${reason}`,
    };

    setOutputs((prev) =>
      prev.map((o) =>
        o.id === outputId
          ? {
              ...o,
              status: "cancelled",
              cancelReason: reason,
              cancelledAt: new Date().toISOString(),
            }
          : o
      )
    );
    setCaisseMovements((prev) => [caisseEntry, ...prev]);
    setSettings((prev) => ({ ...prev, caisseBalance: newCaisse }));

    logAudit("EXPENSE_CANCELLED", `Expense ID ${outputId} cancelled: ${reason}`);
    return { success: true };
  };

  // Users
  const addUser = (userData: Omit<User, "id" | "createdAt">) => {
    if (!hasPermission("Admin")) return { success: false, error: "Only Admin can create users" };
    if (!userData.username.trim()) return { success: false, error: "Username is required" };
    if (users.some((u) => u.username.toLowerCase() === userData.username.toLowerCase().trim())) {
      return { success: false, error: "Username already exists" };
    }

    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      createdAt: todayStr,
    };

    setUsers((prev) => [...prev, newUser]);
    logAudit("USER_CREATED", `User ${newUser.username} (${newUser.role}) created`);
    return { success: true };
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    if (!hasPermission("Admin")) return { success: false, error: "Only Admin can update users" };
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logAudit("USER_UPDATED", `User ${id} updated`);
    return { success: true };
  };

  const deleteUser = (id: string) => {
    if (!hasPermission("Admin")) return { success: false, error: "Only Admin can delete users" };
    if (currentUser?.id === id) return { success: false, error: "Cannot delete your own active user account" };

    // Check if user has transactions
    const hasHistory =
      sales.some((s) => s.operatorId === id) ||
      purchases.some((p) => p.operatorId === id) ||
      incomes.some((i) => i.operatorId === id) ||
      outputs.some((o) => o.operatorId === id);

    if (hasHistory) {
      // Deactivate instead of hard delete
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, active: false } : u))
      );
      logAudit("USER_DEACTIVATED", `User ${id} deactivated (has transaction history)`);
      return { success: true };
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAudit("USER_DELETED", `User ${id} deleted`);
    return { success: true };
  };

  // Backup & Restore
  const createBackup = (label = "Manual Backup"): BackupItem => {
    const snapshot = {
      users,
      products,
      clients,
      sales,
      purchases,
      stockMovements,
      creditPayments,
      incomes,
      outputs,
      caisseMovements,
      auditLogs,
      settings,
      timestamp: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(snapshot, null, 2);
    const sizeKb = Math.max(1, Math.round(jsonStr.length / 1024));

    const item: BackupItem = {
      id: `bk-${Date.now()}`,
      filename: `sellpoint_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
      date: new Date().toISOString().replace("T", " ").substring(0, 19),
      sizeKb,
      data: jsonStr,
    };

    setBackups((prev) => [item, ...prev]);
    logAudit("BACKUP_CREATED", `Backup created: ${item.filename} (${sizeKb} KB)`);
    return item;
  };

  const restoreBackup = (backupId: string) => {
    if (!hasPermission("Admin")) return { success: false, error: "Only Admins can restore backups" };
    const b = backups.find((bk) => bk.id === backupId);
    if (!b || !b.data) return { success: false, error: "Backup data not found" };

    return restoreFromData(b.data);
  };

  const restoreFromData = (jsonData: string) => {
    if (!hasPermission("Admin")) return { success: false, error: "Only Admins can restore backups" };
    try {
      // Auto-backup current state before restoring (SRS requirement)
      createBackup("Auto-backup before restore");

      const data = JSON.parse(jsonData);
      if (data.users) setUsers(data.users);
      if (data.products) setProducts(data.products);
      if (data.clients) setClients(data.clients);
      if (data.sales) setSales(data.sales);
      if (data.purchases) setPurchases(data.purchases);
      if (data.stockMovements) setStockMovements(data.stockMovements);
      if (data.creditPayments) setCreditPayments(data.creditPayments);
      if (data.incomes) setIncomes(data.incomes);
      if (data.outputs) setOutputs(data.outputs);
      if (data.caisseMovements) setCaisseMovements(data.caisseMovements);
      if (data.settings) setSettings(data.settings);

      logAudit("BACKUP_RESTORED", "Database restored successfully from backup");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: `Invalid backup format: ${e.message}` };
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      logAudit("SETTINGS_UPDATED", "System settings updated");
      return updated;
    });
  };

  const resetAllData = () => {
    setUsers(initialUsers);
    setProducts(initialProducts);
    setClients(initialClients);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setStockMovements(initialStockMovements);
    setCreditPayments(initialCreditPayments);
    setIncomes(initialIncomes);
    setOutputs(initialOutputs);
    setCaisseMovements(initialCaisseMovements);
    setSettings(initialSettings);
    setCurrentUser(initialUsers[0]);
    localStorage.removeItem(STORAGE_KEY);
    logAudit("SYSTEM_RESET", "All data reset to initial seed state");
  };

  return (
    <SellPointContext.Provider
      value={{
        currentUser,
        users,
        products,
        clients,
        sales,
        purchases,
        stockMovements,
        creditPayments,
        incomes,
        outputs,
        caisseMovements,
        auditLogs,
        backups,
        settings,
        isHydrated,

        login,
        logout,
        switchUserRole,
        changePassword,

        processSale,
        cancelSale,

        processRestock,
        cancelRestock,

        addProduct,
        updateProduct,
        deleteProduct,
        correctStock,
        importProducts,

        makeCreditPayment,

        adjustCaisse,
        reconcileCaisse,

        addIncome,
        cancelIncome,
        addOutput,
        cancelOutput,

        addUser,
        updateUser,
        deleteUser,

        createBackup,
        restoreBackup,
        restoreFromData,

        updateSettings,
        resetAllData,

        hasPermission,
      }}
    >
      {children}
    </SellPointContext.Provider>
  );
}

export function useSellPoint() {
  const ctx = useContext(SellPointContext);
  if (!ctx) throw new Error("useSellPoint must be used within SellPointProvider");
  return ctx;
}
