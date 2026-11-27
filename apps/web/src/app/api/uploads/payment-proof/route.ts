import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createUploadUrl } from "@/lib/storage";

const schema=z.object({contentType:z.enum(["image/jpeg","image/png","image/webp"]),size:z.number().int().positive().max(5*1024*1024)});
export async function POST(request:Request) {
  const user=await getSessionUser();
  if(!user) return NextResponse.json({error:"Login required"},{status:401});
  try {
    const input=schema.parse(await request.json());
    const ext=input.contentType==="image/jpeg"?"jpg":input.contentType==="image/png"?"png":"webp";
    const key=`payment-proofs/${user.id}/${randomUUID()}.${ext}`;
    const uploadUrl=await createUploadUrl(key,input.contentType);
    return NextResponse.json({key,uploadUrl,expiresIn:300});
  } catch {
    return NextResponse.json({error:"Invalid file or private storage is not configured"},{status:400});
  }
}
