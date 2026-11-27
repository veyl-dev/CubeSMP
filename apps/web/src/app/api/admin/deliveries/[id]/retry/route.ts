import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";
export async function POST(_request:Request,context:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["OWNER","ADMIN"]);if(auth.response)return auth.response;
 const {id}=await context.params;
 try{
  await prisma.$transaction(async tx=>{
   const job=await tx.deliveryJob.findUnique({where:{id}});
   if(!job)throw new Error("NOT_FOUND");
   if(job.status!=="FAILED")throw new Error("NOT_FAILED");
   await tx.deliveryJob.update({where:{id},data:{status:"QUEUED",attempts:0,claimedAt:null,claimedBy:null,lastError:null}});
   await tx.deliveryLog.create({data:{jobId:id,event:"MANUAL_RETRY",detail:"Manually requeued by "+auth.user!.email}});
   await tx.auditLog.create({data:{actorId:auth.user!.id,action:"DELIVERY_RETRIED",entityType:"DeliveryJob",entityId:id}});
  });
  return NextResponse.json({ok:true});
 }catch(error){
  const message=error instanceof Error?error.message:"";
  if(message==="NOT_FOUND")return NextResponse.json({error:"Delivery not found"},{status:404});
  if(message==="NOT_FAILED")return NextResponse.json({error:"Only failed deliveries can be manually retried"},{status:409});
  return NextResponse.json({error:"Unable to retry delivery"},{status:500});
 }
}
