import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
const schema=z.object({minecraftName:z.string().regex(/^[A-Za-z0-9_]{3,16}$/).optional(),currentPassword:z.string().min(1).max(128).optional(),newPassword:z.string().min(12).max(128).optional()}).refine(v=>v.minecraftName!==undefined||(v.currentPassword!==undefined&&v.newPassword!==undefined));
export async function PATCH(request:Request){
 const user=await getSessionUser();if(!user)return NextResponse.json({error:"Login required"},{status:401});
 try{
  const input=schema.parse(await request.json());
  const data:{minecraftName?:string;passwordHash?:string}={};
  if(input.minecraftName)data.minecraftName=input.minecraftName;
  if(input.newPassword){
   if(!input.currentPassword||!(await bcrypt.compare(input.currentPassword,user.passwordHash)))return NextResponse.json({error:"Current password is incorrect"},{status:400});
   data.passwordHash=await bcrypt.hash(input.newPassword,12);
  }
  const updated=await prisma.user.update({where:{id:user.id},data});
  await prisma.auditLog.create({data:{actorId:user.id,action:"ACCOUNT_SETTINGS_UPDATED",entityType:"User",entityId:user.id}});
  return NextResponse.json({user:{email:updated.email,minecraftName:updated.minecraftName}});
 }catch(error){
  if(typeof error==="object"&&error!==null&&"code"in error&&error.code==="P2002")return NextResponse.json({error:"Minecraft username is already in use"},{status:409});
  return NextResponse.json({error:"Invalid account settings"},{status:400});
 }
}
