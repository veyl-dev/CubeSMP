import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";

const schema=z.object({role:z.enum(["PLAYER","MODERATOR","ADMIN","OWNER"]).optional(),suspended:z.boolean().optional(),pointsDelta:z.number().int().min(-1000000).max(1000000).optional()}).refine(v=>Object.keys(v).length>0);
export async function PATCH(request:Request,context:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 const {id}=await context.params;
 try{
  const input=schema.parse(await request.json());
  const target=await prisma.user.findUnique({where:{id}});
  if(!target)return NextResponse.json({error:"Player not found"},{status:404});
  if(auth.user!.role!=="OWNER"&&(input.role==="OWNER"||target.role==="OWNER"||input.role==="ADMIN"))return NextResponse.json({error:"Only the Owner can manage administrator roles"},{status:403});
  if(input.role==="OWNER"&&auth.user!.role!=="OWNER")return NextResponse.json({error:"Owner permission required"},{status:403});
  const result=await prisma.$transaction(async tx=>{
   const user=await tx.user.update({where:{id},data:{...(input.role?{role:input.role}:{}),...(input.suspended!==undefined?{suspended:input.suspended}:{}),...(input.pointsDelta!==undefined?{pointsBalance:{increment:input.pointsDelta}}:{})}});
   if(input.pointsDelta!==undefined&&input.pointsDelta!==0)await tx.pointLedger.create({data:{userId:id,delta:input.pointsDelta,reason:"Administrator adjustment",actorId:auth.user!.id}});
   await tx.auditLog.create({data:{actorId:auth.user!.id,action:"PLAYER_UPDATED",entityType:"User",entityId:id,metadata:input}});
   return {id:user.id,role:user.role,pointsBalance:user.pointsBalance,suspended:user.suspended};
  });
  return NextResponse.json({user:result});
 }catch{return NextResponse.json({error:"Invalid player update"},{status:400});}
}
