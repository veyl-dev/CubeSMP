import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";
const schema=z.object({name:z.string().min(2).max(60),slug:z.string().regex(/^[a-z0-9-]+$/).max(80)});
export async function GET(){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 return NextResponse.json({categories:await prisma.productCategory.findMany({orderBy:{name:"asc"}})});
}
export async function POST(request:Request){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 try{
  const input=schema.parse(await request.json());
  const category=await prisma.productCategory.create({data:input});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"CATEGORY_CREATED",entityType:"ProductCategory",entityId:category.id}});
  return NextResponse.json({category},{status:201});
 }catch{return NextResponse.json({error:"Invalid category or name/slug already exists"},{status:400});}
}
