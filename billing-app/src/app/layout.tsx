// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Shivam Traders — Billing",
  description: "GST Billing & Invoice Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden" style={{ background: "var(--ink)" }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#080c10" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#080c10" } },
          }}
        />
      </body>
    </html>
  );
}
