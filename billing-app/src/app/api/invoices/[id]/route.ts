// src/app/api/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status, notes, dueDate, buyerName, buyerAddress, buyerGST, buyerPhone, buyerEmail } = body;

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(buyerName && { buyerName }),
        ...(buyerAddress !== undefined && { buyerAddress }),
        ...(buyerGST !== undefined && { buyerGST }),
        ...(buyerPhone !== undefined && { buyerPhone }),
        ...(buyerEmail !== undefined && { buyerEmail }),
      },
      include: { items: true },
    });
    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.invoice.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
