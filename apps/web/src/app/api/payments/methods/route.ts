import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";
export async function GET(){
 const methods=await prisma.paymentMethodSetting.findMany({where:{enabled:true},select:{method:true,accountName:true,accountNumber:true,instructions:true,qrObjectKey:true}});
 const result=await Promise.all(methods.map(async m=>({method:m.method,accountName:m.accountName,accountNumber:m.accountNumber,instructions:m.instructions,qrUrl:m.qrObjectKey?await createDownloadUrl(m.qrObjectKey).catch(()=>null):null})));
 return NextResponse.json({methods:result});
}
