import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ProductManager from "./product-manager";
export default async function AdminStorePage(){
 const user=await getSessionUser();if(!user)redirect("/login");if(!["OWNER","ADMIN"].includes(user.role))redirect("/admin");
 const products=await prisma.product.findMany({orderBy:{createdAt:"desc"}});
 return <main className="mx-auto min-h-screen max-w-6xl px-5 py-10"><Link href="/admin" className="text-sm font-bold text-sky-400">← Admin dashboard</Link><h1 className="mt-8 text-3xl font-black">Store management</h1><p className="mt-2 text-sm text-slate-400">Prices are stored in the database in centavos. Disabled products are hidden from players.</p><ProductManager initial={products.map(p=>({id:p.id,name:p.name,slug:p.slug,description:p.description,priceMinor:p.priceMinor,type:p.type,pointsAmount:p.pointsAmount,rankKey:p.rankKey,enabled:p.enabled,deliveryCommands:Array.isArray(p.deliveryCommands)?p.deliveryCommands.filter((x):x is string=>typeof x==="string"):[]}))}/></main>;
}
