import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const methods=await prisma.paymentMethodSetting.findMany({where:{enabled:true},select:{method:true,accountName:true,accountNumber:true,instructions:true,qrObjectKey:true}});
  return NextResponse.json({methods});
}
