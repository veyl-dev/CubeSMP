import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const products = await prisma.product.findMany({
    where: { enabled: true, ...(type === "RANK" || type === "POINTS" || type === "ITEM" ? { type } : {}) },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: { id: true, name: true, slug: true, description: true, imageUrl: true, priceMinor: true, currency: true, type: true, pointsAmount: true, rankKey: true, benefits: true }
  });
  return NextResponse.json({ products });
}
