import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";

const schema=z.object({key:z.string().min(1).max(100),value:z.unknown().refine(value=>value!==null)});
export async function GET(){
 const auth=await requireRoles(["OWNER"]);if(auth.response)return auth.response;
 const settings=await prisma.websiteSetting.findMany();
 return NextResponse.json({settings});
}
export async function PUT(request:Request){
 const auth=await requireRoles(["OWNER"]);if(auth.response)return auth.response;
 try{
  const {key,value}=schema.parse(await request.json());
  const setting=await prisma.websiteSetting.upsert({where:{key},create:{key,value:value as Prisma.InputJsonValue},update:{value:value as object}});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"WEBSITE_SETTING_UPDATED",entityType:"WebsiteSetting",entityId:key}});
  return NextResponse.json({setting});
 }catch{return NextResponse.json({error:"Invalid website setting"},{status:400});}
}
