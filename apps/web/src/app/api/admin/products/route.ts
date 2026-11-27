import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";

const schema=z.object({name:z.string().min(2).max(80),slug:z.string().regex(/^[a-z0-9-]+$/).max(100),description:z.string().max(2000).default(""),priceMinor:z.number().int().positive(),type:z.enum(["RANK","POINTS","ITEM"]),pointsAmount:z.number().int().positive().optional(),rankKey:z.string().max(40).optional(),enabled:z.boolean().default(true),deliveryCommands:z.array(z.string().max(300)).max(20).default([]),benefits:z.array(z.string().max(200)).max(30).default([])});
export async function POST(request:Request){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 try{
  const data=schema.parse(await request.json());
  if(data.enabled&&(data.priceMinor<=0||data.deliveryCommands.length===0))return NextResponse.json({error:"Enabled products need a positive price and at least one delivery command"},{status:400});
  const product=await prisma.product.create({data});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"PRODUCT_CREATED",entityType:"Product",entityId:product.id}});
  return NextResponse.json({product},{status:201});
 }catch{return NextResponse.json({error:"Invalid product or slug already exists"},{status:400});}
}
