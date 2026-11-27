import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";
const schema=z.object({title:z.string().min(2).max(120).optional(),body:z.string().min(2).max(5000).optional(),published:z.boolean().optional()});
export async function PATCH(request:Request,context:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 const {id}=await context.params;
 try{
  const input=schema.parse(await request.json());
  const item=await prisma.announcement.update({where:{id},data:{...input,...(input.published===undefined?{}:{publishedAt:input.published?new Date():null})}});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"ANNOUNCEMENT_UPDATED",entityType:"Announcement",entityId:id}});
  return NextResponse.json({announcement:item});
 }catch{return NextResponse.json({error:"Invalid update or announcement not found"},{status:400});}
}
export async function DELETE(_request:Request,context:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 const {id}=await context.params;
 try{
  await prisma.announcement.delete({where:{id}});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"ANNOUNCEMENT_DELETED",entityType:"Announcement",entityId:id}});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Announcement not found"},{status:404});}
}
