"use client";
// src/app/dashboard/page.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import Link from "next/link";
import { IndianRupee, FileText, Package, AlertTriangle, FilePlus, ArrowRight, TrendingUp } from "lucide-react";
import { format } from "date-fns";

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="card p-5 flex gap-4 items-start hover:border-[var(--border2)] transition-colors">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color, border: `1px solid ${color}` }}>
        <Icon size={18} className="opacity-90" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="text-2xl font-bold text-white" style={{ fontFamily: "'DM Mono', monospace" }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
      </div>
    </div>
  );
}

function MiniBar({ month, revenue, max }: { month: string; revenue: number; max: number }) {
  const h = max > 0 ? Math.max((revenue / max) * 100, 4) : 4;
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
        {revenue > 0 ? `₹${Math.round(revenue / 1000)}k` : "—"}
      </span>
      <div className="w-full rounded-t-sm transition-all" style={{ height: `${h}%`, background: revenue > 0 ? "var(--accent)" : "var(--border)", opacity: revenue > 0 ? 1 : 0.4, minHeight: 4 }} />
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{month}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.stats().then(setStats).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const maxRev = stats ? Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1) : 1;

  if (loading) return (
    <div className="p-8 flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
      <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      Loading dashboard...
    </div>
  );

  return (
    <div className="p-8 max-w-7xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">{format(new Date(), "EEEE, dd MMMM yyyy")}</p>
        </div>
        <Link href="/invoices/new" className="btn-blue">
          <FilePlus size={15} /> New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={fmt(stats?.totalRevenue ?? 0)} icon={IndianRupee}
          color="rgba(59,130,246,0.15)" sub="From paid invoices" />
        <StatCard label="Total Invoices" value={String(stats?.totalInvoices ?? 0)} icon={FileText}
          color="rgba(16,185,129,0.15)" sub={`${stats?.unpaidCount ?? 0} pending payment`} />
        <StatCard label="Products" value={String(stats?.totalProducts ?? 0)} icon={Package}
          color="rgba(139,92,246,0.15)" sub="In catalogue" />
        <StatCard label="Overdue" value={String(stats?.overdueCount ?? 0)} icon={AlertTriangle}
          color="rgba(239,68,68,0.15)" sub="Require attention" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card p-5 col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-semibold text-white">Monthly Revenue</h2>
          </div>
          <div className="flex items-end gap-2 h-32">
            {stats?.monthlyRevenue.map((m) => (
              <MiniBar key={m.month} month={m.month} revenue={m.revenue} max={maxRev} />
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="card overflow-hidden col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold text-white">Recent Invoices</h2>
            <Link href="/invoices" className="text-xs flex items-center gap-1 hover:gap-2 transition-all" style={{ color: "var(--accent)" }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {!stats?.recentInvoices.length ? (
            <div className="p-10 text-center" style={{ color: "var(--text-muted)" }}>
              <FileText size={36} className="mx-auto mb-3 opacity-30" />
              <p>No invoices yet.</p>
              <Link href="/invoices/new" className="text-xs mt-2 inline-block hover:underline" style={{ color: "var(--accent)" }}>
                Create your first invoice →
              </Link>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInvoices.map((inv) => (
                  <tr key={inv.id} className="cursor-pointer" onClick={() => window.location.href = `/invoices/${inv.id}`}>
                    <td>
                      <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>{inv.invoiceNumber}</span>
                    </td>
                    <td className="font-medium">{inv.buyerName}</td>
                    <td className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {inv.invoiceDate ? format(new Date(inv.invoiceDate), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="font-mono font-semibold">{fmt(inv.grandTotal)}</td>
                    <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
