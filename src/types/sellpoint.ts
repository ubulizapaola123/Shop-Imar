export type UserRole = "Admin" | "Manager" | "Cashier";

export interface User {
  id: string;
  names: string;
  username: string;
  password: string; // hashed or stored for offline demo
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  minStock: number;
  archived: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalDebt: number;
  createdAt: string;
}

export interface SaleLine {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  sellPrice: number;
  costPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  date: string;
  clientId?: string;
  clientName: string;
  operatorId: string;
  operatorName: string;
  total: number;
  paidAmount: number;
  creditAmount: number;
  status: "completed" | "cancelled";
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  lines: SaleLine[];
}

export interface PurchaseLine {
  id: string;
  purchaseId: string;
  productId: string;
  productName: string;
  quantity: number;
  buyPrice: number;
  lineTotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  date: string;
  supplier?: string;
  total: number;
  operatorId: string;
  operatorName: string;
  status: "completed" | "cancelled";
  cancelReason?: string;
  cancelledAt?: string;
  lines: PurchaseLine[];
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: "sale" | "purchase" | "correction" | "cancel_sale" | "cancel_purchase";
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  operatorName: string;
}

export interface CreditPayment {
  id: string;
  saleId: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  operatorId: string;
  operatorName: string;
  note?: string;
}

export interface Income {
  id: string;
  date: string;
  operatorId: string;
  operatorName: string;
  amount: number;
  reason: string;
  status: "active" | "cancelled";
  cancelReason?: string;
  cancelledAt?: string;
}

export interface OutputExpense {
  id: string;
  date: string;
  operatorId: string;
  operatorName: string;
  amount: number;
  reason: string;
  details: string;
  status: "active" | "cancelled";
  cancelReason?: string;
  cancelledAt?: string;
}

export interface CaisseMovement {
  id: string;
  date: string;
  operatorName: string;
  type: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  reason: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operatorName: string;
  action: string;
  details: string;
}

export interface BackupItem {
  id: string;
  filename: string;
  date: string;
  sizeKb: number;
  data: string; // JSON string of database snapshot
}

export interface AppSettings {
  shopName: string;
  address: string;
  phone: string;
  tin: string;
  receiptHeader: string;
  receiptFooter: string;
  printer: string;
  language: "English" | "Kinyarwanda" | "French";
  outputReasons: string[];
  allowNegativeStock: boolean;
  allowBackdatedSales: boolean;
  caisseBalance: number;
}
