"use client";
// src/app/invoices/page.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import Link from "next/link";
import { FileText, FilePlus, Eye, Trash2, ChevronDown, Search } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

const STATUSES: InvoiceStatus[] = ["DRAFT", "UNPAID", "PAID", "OVERDUE"];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setInvoices(await api.invoices.list()); }
    catch { toast.error("Failed to load invoices"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Delete invoice ${num}? This cannot be undone.`)) return;
    try { await api.invoices.delete(id); toast.success("Deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleStatus = async (id: string, status: InvoiceStatus) => {
    try { await api.invoices.update(id, { status }); toast.success("Status updated"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const filtered = invoices
    .filter((i) => filter === "ALL" || i.status === filter)
    .filter((i) =>
      !search ||
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.buyerName.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-8 max-w-7xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-sub">{invoices.length} total records</p>
        </div>
        <Link href="/invoices/new" className="btn-blue">
          <FilePlus size={15} /> New Invoice
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex gap-1.5">
          {["ALL", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all border"
              style={{
                background: filter === s ? "var(--accent)" : "transparent",
                color: filter === s ? "white" : "var(--text-muted)",
                borderColor: filter === s ? "var(--accent)" : "var(--border)",
              }}>
              {s}
              <span className="ml-1.5 opacity-70">
                {s === "ALL" ? invoices.length : invoices.filter((i) => i.status === s).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input className="input pl-8 w-56 text-xs py-2" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <FileText size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold text-white">Invoice Records</h2>
          <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded" style={{ background: "var(--surface3)", color: "var(--text-muted)" }}>
            {filtered.length} shown
          </span>
        </div>
        {loading ? (
          <div className="p-10 text-center" style={{ color: "var(--text-muted)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center">
            <FileText size={40} className="mx-auto mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-muted)" }}>No invoices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>GSTIN</th>
                  <th>Date</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold" style={{ color: "var(--accent)" }}>
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td>
                      <p className="font-medium text-white text-sm">{inv.buyerName}</p>
                      {inv.buyerPhone && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{inv.buyerPhone}</p>}
                    </td>
                    <td className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{inv.buyerGST || "—"}</td>
                    <td className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {inv.invoiceDate ? format(new Date(inv.invoiceDate), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="font-mono text-sm">{fmt(inv.subtotal)}</td>
                    <td className="font-mono text-sm" style={{ color: "#fbbf24" }}>{fmt(inv.totalTax)}</td>
                    <td className="font-mono font-bold text-white">{fmt(inv.grandTotal)}</td>
                    <td>
                      <div className="relative group">
                        <button className={`badge badge-${inv.status} cursor-pointer flex items-center gap-1`}>
                          {inv.status} <ChevronDown size={9} />
                        </button>
                        <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block rounded-lg overflow-hidden shadow-xl border"
                          style={{ background: "var(--surface2)", borderColor: "var(--border)", minWidth: 110 }}>
                          {STATUSES.map((s) => (
                            <button key={s} onClick={() => handleStatus(inv.id, s)}
                              className="block w-full text-left px-3 py-2 text-xs capitalize transition-colors hover:bg-[var(--surface3)]"
                              style={{ color: "var(--text-dim)" }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link href={`/invoices/${inv.id}`}
                          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface3)]"
                          style={{ color: "var(--text-muted)" }}>
                          <Eye size={13} />
                        </Link>
                        <button onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                          style={{ color: "var(--text-muted)" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
