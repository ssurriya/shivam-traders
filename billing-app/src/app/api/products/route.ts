// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, hsnCode, unit, price, gstRate, description } = body;

    if (!name || !hsnCode || !price) {
      return NextResponse.json({ error: "name, hsnCode, and price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        hsnCode: hsnCode.trim(),
        unit: unit || "Pcs",
        price: parseFloat(price),
        gstRate: parseFloat(gstRate ?? 18),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
