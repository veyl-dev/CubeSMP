import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";

const schema=z.object({
 name:z.string().min(2).max(80).optional(),
 slug:z.string().regex(/^[a-z0-9-]+$/).max(100).optional(),
 description:z.string().max(2000).optional(),
 priceMinor:z.number().int().nonnegative().optional(),
 type:z.enum(["RANK","POINTS","ITEM"]).optional(),
 pointsAmount:z.number().int().positive().nullable().optional(),
 rankKey:z.string().max(40).nullable().optional(),
 enabled:z.boolean().optional(),
 featured:z.boolean().optional(),
 benefits:z.array(z.string().max(200)).max(30).nullable().optional(),
 deliveryCommands:z.array(z.string().max(300)).max(20).optional()
});
export async function PATCH(request:Request,context:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 const {id}=await context.params;
 try{
  const data=schema.parse(await request.json());
  if(data.enabled){const current=await prisma.product.findUnique({where:{id}});const price=data.priceMinor??current?.priceMinor??0;const commands=data.deliveryCommands??(Array.isArray(current?.deliveryCommands)?current.deliveryCommands.filter((v):v is string=>typeof v==="string"):[]);if(price<=0||commands.length===0)return NextResponse.json({error:"Enabled products need a positive price and at least one delivery command"},{status:400});}
  const product=await prisma.product.update({where:{id},data});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"PRODUCT_UPDATED",entityType:"Product",entityId:id}});
  return NextResponse.json({product});
 }catch{return NextResponse.json({error:"Invalid update or product not found"},{status:400});}
}
export async function DELETE(_request:Request,context:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 const {id}=await context.params;
 try{
  await prisma.product.update({where:{id},data:{enabled:false}});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"PRODUCT_DISABLED",entityType:"Product",entityId:id}});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Product not found"},{status:404});}
}
