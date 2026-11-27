import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";
import { uploadPrivateObject } from "@/lib/storage";
export const runtime="nodejs";
export async function POST(request:Request){
 const auth=await requireRoles(["OWNER"]);if(auth.response)return auth.response;
 try{
  const form=await request.formData();const file=form.get("file");
  if(!(file instanceof File)||file.size<16||file.size>5*1024*1024)return NextResponse.json({error:"Choose an image up to 5 MB"},{status:400});
  const bytes=Buffer.from(await file.arrayBuffer());let type="",ext="";
  if(bytes.subarray(0,3).equals(Buffer.from([0xff,0xd8,0xff]))){type="image/jpeg";ext="jpg";}
  else if(bytes.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))){type="image/png";ext="png";}
  else if(bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP"){type="image/webp";ext="webp";}
  if(!type)return NextResponse.json({error:"Only JPG, PNG, or WebP images are accepted"},{status:400});
  const key=`site-assets/logo-${randomUUID()}.${ext}`;
  await uploadPrivateObject(key,bytes,type);
  await prisma.websiteSetting.upsert({where:{key:"logo_key"},create:{key:"logo_key",value:key},update:{value:key}});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"SITE_LOGO_UPDATED",entityType:"WebsiteSetting",entityId:"logo_key"}});
  return NextResponse.json({key});
 }catch{return NextResponse.json({error:"Logo upload failed. Check Supabase Storage configuration."},{status:503});}
}
