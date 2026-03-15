// src/app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, hsnCode, unit, price, gstRate, description } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(hsnCode && { hsnCode: hsnCode.trim() }),
        ...(unit && { unit }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(gstRate !== undefined && { gstRate: parseFloat(gstRate) }),
        description: description?.trim() || null,
      },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
