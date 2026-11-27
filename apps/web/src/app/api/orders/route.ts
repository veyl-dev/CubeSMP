import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const schema=z.object({
  productId:z.string().min(1),
  method:z.enum(["GCASH","MAYA"]),
  referenceNumber:z.string().min(4).max(100),
  amountMinor:z.number().int().positive(),
  proofObjectKey:z.string().min(10)
});
export async function POST(request:Request) {
  const user=await getSessionUser();
  if(!user) return NextResponse.json({error:"Login required"},{status:401});
  try {
    const input=schema.parse(await request.json());
    if(!input.proofObjectKey.startsWith(`payment-proofs/${user.id}/`)) return NextResponse.json({error:"Invalid proof upload"},{status:400});
    const [product,method,duplicate]=await Promise.all([
      prisma.product.findFirst({where:{id:input.productId,enabled:true}}),
      prisma.paymentMethodSetting.findUnique({where:{method:input.method}}),
      prisma.paymentTransaction.findFirst({where:{method:input.method,referenceNumber:input.referenceNumber}})
    ]);
    if(!product) return NextResponse.json({error:"Product is unavailable"},{status:404});
    if(!method?.enabled) return NextResponse.json({error:"Payment method is unavailable"},{status:400});
    if(duplicate) return NextResponse.json({error:"This payment reference has already been submitted"},{status:409});
    if(input.amountMinor!==product.priceMinor) return NextResponse.json({error:"Submitted amount does not match product price"},{status:400});
    const order=await prisma.order.create({data:{
      userId:user.id,totalMinor:product.priceMinor,currency:product.currency,
      items:{create:{productId:product.id,quantity:1,unitPriceMinor:product.priceMinor,productName:product.name}},
      payment:{create:{method:input.method,referenceNumber:input.referenceNumber,amountMinor:input.amountMinor,proofObjectKey:input.proofObjectKey}}
    }});
    return NextResponse.json({orderId:order.id,status:"PENDING"},{status:201});
  } catch(error) {
    if(error instanceof z.ZodError) return NextResponse.json({error:"Invalid checkout details"},{status:400});
    if(typeof error==="object"&&error!==null&&"code" in error&&error.code==="P2002")return NextResponse.json({error:"This payment reference has already been submitted"},{status:409});
    return NextResponse.json({error:"Unable to submit payment"},{status:500});
  }
}
