// src/lib/api.ts — frontend fetch helpers
import type { Product, Invoice, DashboardStats } from "./types";

const BASE = "/api";

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// ── PRODUCTS ─────────────────────────────────────────────────
export const api = {
  products: {
    list: () => req<Product[]>("/products"),
    create: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) =>
      req<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Product>) =>
      req<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      req<{ success: boolean }>(`/products/${id}`, { method: "DELETE" }),
  },

  invoices: {
    list: (status?: string) =>
      req<Invoice[]>(`/invoices${status ? `?status=${status}` : ""}`),
    get: (id: string) => req<Invoice>(`/invoices/${id}`),
    create: (data: Omit<Invoice, "id" | "createdAt" | "updatedAt">) =>
      req<Invoice>("/invoices", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Invoice>) =>
      req<Invoice>(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      req<{ success: boolean }>(`/invoices/${id}`, { method: "DELETE" }),
  },

  dashboard: {
    stats: () => req<DashboardStats>("/dashboard"),
  },
};
