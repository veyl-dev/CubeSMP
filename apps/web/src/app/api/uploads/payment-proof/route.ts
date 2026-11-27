import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSessionUser } from "@/lib/session";
import { uploadPrivateObject } from "@/lib/storage";

export const runtime="nodejs";
export async function POST(request:Request){
 const user=await getSessionUser();
 if(!user)return NextResponse.json({error:"Login required"},{status:401});
 try{
  const form=await request.formData();
  const file=form.get("proof");
  if(!(file instanceof File))return NextResponse.json({error:"Payment proof is required"},{status:400});
  if(file.size<16||file.size>5*1024*1024)return NextResponse.json({error:"File must be between 16 bytes and 5 MB"},{status:400});
  const bytes=Buffer.from(await file.arrayBuffer());
  let contentType="";
  if(bytes.subarray(0,3).equals(Buffer.from([0xff,0xd8,0xff])))contentType="image/jpeg";
  else if(bytes.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])))contentType="image/png";
  else if(bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP")contentType="image/webp";
  if(!contentType)return NextResponse.json({error:"Only genuine JPG, PNG, or WebP images are accepted"},{status:400});
  const ext=contentType==="image/jpeg"?"jpg":contentType==="image/png"?"png":"webp";
  const key=`payment-proofs/${user.id}/${randomUUID()}.${ext}`;
  await uploadPrivateObject(key,bytes,contentType);
  return NextResponse.json({key},{status:201});
 }catch{return NextResponse.json({error:"Unable to store payment proof. Check Supabase Storage configuration."},{status:503});}
}
