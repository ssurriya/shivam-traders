// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [invoices, totalProducts] = await Promise.all([
      prisma.invoice.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
    ]);

    const totalRevenue = invoices
      .filter((i) => i.status === "PAID")
      .reduce((s, i) => s + i.grandTotal, 0);

    const unpaidCount = invoices.filter((i) => i.status === "UNPAID").length;
    const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;
    const recentInvoices = invoices.slice(0, 8);

    // Monthly revenue (last 6 months)
    const now = new Date();
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
      const revenue = invoices
        .filter((inv) => {
          const invDate = new Date(inv.invoiceDate);
          return (
            inv.status === "PAID" &&
            invDate.getMonth() === d.getMonth() &&
            invDate.getFullYear() === d.getFullYear()
          );
        })
        .reduce((s, inv) => s + inv.grandTotal, 0);
      return { month: label, revenue };
    });

    return NextResponse.json({
      totalRevenue,
      totalInvoices: invoices.length,
      totalProducts,
      overdueCount,
      unpaidCount,
      recentInvoices,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
