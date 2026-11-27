import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";

const schema=z.object({method:z.enum(["GCASH","MAYA"]),accountName:z.string().min(2).max(100),accountNumber:z.string().min(5).max(40),instructions:z.string().max(1000),enabled:z.boolean(),qrObjectKey:z.string().startsWith("payment-qr/").nullable().optional()});
export async function GET(){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 if(auth.user!.role!=="OWNER")return NextResponse.json({error:"Owner permission required"},{status:403});
 const settings=await prisma.paymentMethodSetting.findMany();
 return NextResponse.json({settings});
}
export async function PUT(request:Request){
 const auth=await requireRoles(["OWNER"]);if(auth.response)return auth.response;
 try{
  const input=schema.parse(await request.json());
  const setting=await prisma.paymentMethodSetting.upsert({where:{method:input.method},create:input,update:input});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"PAYMENT_METHOD_UPDATED",entityType:"PaymentMethodSetting",entityId:input.method}});
  return NextResponse.json({setting});
 }catch{return NextResponse.json({error:"Invalid payment settings"},{status:400});}
}
