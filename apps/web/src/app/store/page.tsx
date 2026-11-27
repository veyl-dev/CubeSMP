import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function StorePage() {
  const products=await prisma.product.findMany({where:{enabled:true},orderBy:[{featured:"desc"},{createdAt:"desc"}]});
  return <main className="mx-auto min-h-screen max-w-7xl px-5 py-10"><Link href="/" className="font-black text-sky-400">CUBESMP</Link><h1 className="mt-12 text-4xl font-black">Store</h1><p className="mt-3 text-slate-400">Choose an upgrade for your adventure.</p><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map(p=><article key={p.id} className="rounded-2xl border border-white/10 bg-panel p-6"><div className="text-xs font-bold tracking-widest text-sky-400">{p.type}</div><h2 className="mt-3 text-2xl font-black">{p.name}</h2><p className="mt-2 min-h-12 text-sm text-slate-400">{p.description}</p><p className="mt-6 text-xl font-black">₱{(p.priceMinor/100).toFixed(2)}</p><Link href={`/checkout/${p.id}`} className="mt-5 block rounded-xl bg-brand-gradient px-4 py-3 text-center text-sm font-extrabold">Purchase</Link></article>)}</div>{products.length===0&&<p className="mt-10 rounded-2xl border border-white/10 bg-panel p-8 text-slate-400">The store is being prepared. Products will appear here when an administrator adds them.</p>}</main>;
}
