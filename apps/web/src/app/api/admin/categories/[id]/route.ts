import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";
export async function DELETE(_request:Request,context:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 const {id}=await context.params;
 try{
  await prisma.productCategory.delete({where:{id}});
  await prisma.auditLog.create({data:{actorId:auth.user!.id,action:"CATEGORY_DELETED",entityType:"ProductCategory",entityId:id}});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Category not found"},{status:404});}
}
