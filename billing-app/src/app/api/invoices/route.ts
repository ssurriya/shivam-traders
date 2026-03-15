// src/app/api/invoices/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const invoices = await prisma.invoice.findMany({
      where: status ? { status: status.toUpperCase() as any } : undefined,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      invoiceNumber, invoiceDate, dueDate,
      buyerName, buyerAddress, buyerGST, buyerPhone, buyerEmail,
      taxType, items, notes, status,
      subtotal, totalCGST, totalSGST, totalIGST, totalTax, grandTotal,
    } = body;

    if (!buyerName || !items?.length) {
      return NextResponse.json({ error: "buyerName and items are required" }, { status: 400 });
    }

    // Auto-generate invoice number if not provided
    let invNumber = invoiceNumber;
    if (!invNumber) {
      const count = await prisma.invoice.count();
      const year = new Date().getFullYear();
      invNumber = `ST-${year}-${String(count + 1).padStart(4, "0")}`;
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invNumber,
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        buyerName, buyerAddress, buyerGST, buyerPhone, buyerEmail,
        taxType: taxType || "INTRASTATE",
        notes,
        status: status || "UNPAID",
        subtotal, totalCGST, totalSGST, totalIGST, totalTax, grandTotal,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            hsnCode: item.hsnCode,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            gstRate: item.gstRate,
            amount: item.amount,
            cgst: item.cgst,
            sgst: item.sgst,
            igst: item.igst,
            totalAmount: item.totalAmount,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/invoices error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Invoice number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
