import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";
export async function GET(){
 const setting=await prisma.websiteSetting.findUnique({where:{key:"logo_key"}});
 if(typeof setting?.value!=="string")return NextResponse.redirect(new URL("/cubesmp-logo.svg",process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000"));
 try{return NextResponse.redirect(await createDownloadUrl(setting.value));}
 catch{return NextResponse.redirect(new URL("/cubesmp-logo.svg",process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000"));}
}
