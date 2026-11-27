import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { createDownloadUrl } from "@/lib/storage";
import CheckoutForm from "./form";

export default async function CheckoutPage({params}:{params:Promise<{productId:string}>}) {
  const user=await getSessionUser();
  if(!user) redirect("/login");
  const {productId}=await params;
  const product=await prisma.product.findFirst({where:{id:productId,enabled:true}});
  if(!product) notFound();
  const storedMethods=await prisma.paymentMethodSetting.findMany({where:{enabled:true},select:{method:true,accountName:true,accountNumber:true,instructions:true,qrObjectKey:true}});
  const methods=await Promise.all(storedMethods.map(async m=>({...m,qrUrl:m.qrObjectKey?await createDownloadUrl(m.qrObjectKey).catch(()=>null):null})));
  return <main className="mx-auto min-h-screen max-w-3xl px-5 py-10"><Link href="/store" className="font-black text-sky-400">CUBESMP</Link><h1 className="mt-12 text-3xl font-black">Checkout</h1><div className="mt-6 rounded-2xl border border-white/10 bg-panel p-6"><p className="text-sm text-slate-400">You are purchasing</p><h2 className="mt-2 text-2xl font-black">{product.name}</h2><p className="mt-2 text-xl font-bold">₱{(product.priceMinor/100).toFixed(2)}</p></div><CheckoutForm productId={product.id} priceMinor={product.priceMinor} minecraftName={user.minecraftName} methods={methods}/></main>;
}
