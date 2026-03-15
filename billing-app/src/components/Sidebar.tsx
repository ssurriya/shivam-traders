"use client";
// src/components/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FileText, FilePlus, Layers,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/invoices/new", label: "New Invoice", icon: FilePlus },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <Layers size={15} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
              Shivam Traders
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>GST Billing System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5">
        <p className="section-label px-3 mb-2">Menu</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href) && href !== "/invoices") || (href === "/invoices" && path === "/invoices");
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? "var(--accent-glow)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-dim)",
                border: active ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
              }}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>© 2025 Shivam Traders</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--border2)", fontFamily: "'DM Mono', monospace" }}>
          PostgreSQL · Next.js
        </p>
      </div>
    </aside>
  );
}
