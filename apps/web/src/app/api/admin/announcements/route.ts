import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";
const schema=z.object({title:z.string().min(2).max(120),body:z.string().min(2).max(5000),published:z.boolean().default(false)});
export async function GET(){
 const auth=await requireRoles(["OWNER","ADMIN","MODERATOR"]);if(auth.response)return auth.response;
 return NextResponse.json({announcements:await prisma.announcement.findMany({orderBy:{createdAt:"desc"}})});
}
export async function POST(request:Request){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 try{
  const input=schema.parse(await request.json());
  const announcement=await prisma.announcement.create({data:{...input,publishedAt:input.published?new Date():null}});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"ANNOUNCEMENT_CREATED",entityType:"Announcement",entityId:announcement.id}});
  return NextResponse.json({announcement},{status:201});
 }catch{return NextResponse.json({error:"Invalid announcement"},{status:400});}
}
