import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicObjectUrl } from "@/lib/storage";
export async function GET(request:Request){
 const setting=await prisma.websiteSetting.findUnique({where:{key:"logo_key"}});
 if(typeof setting?.value!=="string")return NextResponse.redirect(new URL("/cubesmp-logo.svg",request.url));
 try{return NextResponse.redirect(publicObjectUrl(setting.value));}
 catch{return NextResponse.redirect(new URL("/cubesmp-logo.svg",process.env.APP_URL??"http://localhost:3000"));}
}
