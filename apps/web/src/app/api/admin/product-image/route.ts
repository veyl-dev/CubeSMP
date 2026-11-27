import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireRoles } from "@/lib/authz";
import { uploadPrivateObject } from "@/lib/storage";
export const runtime="nodejs";
export async function POST(request:Request){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 try{
  const form=await request.formData();const file=form.get("file");
  if(!(file instanceof File)||file.size<16||file.size>5*1024*1024)return NextResponse.json({error:"Choose an image up to 5 MB"},{status:400});
  const bytes=Buffer.from(await file.arrayBuffer());let type="",ext="";
  if(bytes.subarray(0,3).equals(Buffer.from([0xff,0xd8,0xff]))){type="image/jpeg";ext="jpg";}
  else if(bytes.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))){type="image/png";ext="png";}
  else if(bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP"){type="image/webp";ext="webp";}
  if(!type)return NextResponse.json({error:"Only JPG, PNG, or WebP images are accepted"},{status:400});
  const key=`product-images/${randomUUID()}.${ext}`;
  await uploadPrivateObject(key,bytes,type);
  return NextResponse.json({key},{status:201});
 }catch{return NextResponse.json({error:"Could not upload product image. Check Supabase Storage configuration."},{status:503});}
}
