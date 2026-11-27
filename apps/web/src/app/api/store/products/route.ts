import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const products = await prisma.product.findMany({
    where: { enabled: true, ...(type === "RANK" || type === "POINTS" || type === "ITEM" ? { type } : {}) },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: { id: true, name: true, slug: true, description: true, imageUrl: true, priceMinor: true, currency: true, type: true, pointsAmount: true, rankKey: true, benefits: true }
  });
  const result=await Promise.all(products.map(async p=>({...p,imageUrl:p.imageUrl?await createDownloadUrl(p.imageUrl).catch(()=>null):null})));
  return NextResponse.json({ products:result });
}
