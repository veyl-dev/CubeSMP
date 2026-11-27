import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DeliveryActions from "./delivery-actions";
export default async function DeliveriesPage(){
 const user=await getSessionUser();if(!user)redirect("/login");if(!["OWNER","ADMIN"].includes(user.role))redirect("/admin");
 const jobs=await prisma.deliveryJob.findMany({include:{order:{include:{user:true,items:true}},logs:{orderBy:{createdAt:"desc"},take:3}},orderBy:{createdAt:"desc"},take:100});
 return <main className="mx-auto min-h-screen max-w-6xl px-5 py-10"><Link href="/admin" className="text-sm font-bold text-sky-400">← Admin dashboard</Link><h1 className="mt-8 text-3xl font-black">Minecraft delivery queue</h1><p className="mt-2 text-sm text-slate-400">Review delivery attempts. Inspect server logs before retrying failed commands.</p><div className="mt-8 space-y-3">{jobs.map(job=><article key={job.id} className="rounded-2xl border border-white/10 bg-panel p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">{job.order.user.minecraftName} · {job.order.items.map(x=>x.productName).join(", ")}</h2><p className="mt-1 text-xs text-slate-500">Job {job.id} · {job.attempts} attempt(s)</p></div><span className="text-xs font-black text-sky-300">{job.status}</span></div>{job.lastError&&<p className="mt-3 text-sm text-red-300">{job.lastError}</p>}<div className="mt-3 space-y-1">{job.logs.map(log=><p key={log.id} className="text-xs text-slate-500">{log.event} · {log.detail}</p>)}</div>{job.status==="FAILED"&&<DeliveryActions id={job.id}/>}</article>)}{jobs.length===0&&<p className="rounded-xl border border-white/10 bg-panel p-6 text-sm text-slate-500">No delivery jobs yet.</p>}</div></main>;
}
