// src/lib/types.ts

export type TaxType = "INTRASTATE" | "INTERSTATE";
export type InvoiceStatus = "DRAFT" | "UNPAID" | "PAID" | "OVERDUE";

export interface Product {
  id: string;
  name: string;
  hsnCode: string;
  unit: string;
  price: number;
  gstRate: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id?: string;
  productId: string;
  productName: string;
  hsnCode: string;
  unit: string;
  quantity: number;
  price: number;
  gstRate: number;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  buyerName: string;
  buyerAddress?: string | null;
  buyerGST?: string | null;
  buyerPhone?: string | null;
  buyerEmail?: string | null;
  taxType: TaxType;
  subtotal: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalTax: number;
  grandTotal: number;
  notes?: string | null;
  status: InvoiceStatus;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  totalProducts: number;
  overdueCount: number;
  unpaidCount: number;
  recentInvoices: Invoice[];
  monthlyRevenue: { month: string; revenue: number }[];
}
