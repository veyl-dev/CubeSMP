import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import PlayerManager from "./player-manager";
export default async function PlayersPage(){
 const user=await getSessionUser();if(!user)redirect("/login");if(!["OWNER","ADMIN"].includes(user.role))redirect("/admin");
 const players=await prisma.user.findMany({orderBy:{createdAt:"desc"},take:200,select:{id:true,email:true,minecraftName:true,role:true,suspended:true,pointsBalance:true,currentRank:true,createdAt:true}});
 return <main className="mx-auto min-h-screen max-w-6xl px-5 py-10"><Link href="/admin" className="text-sm font-bold text-sky-400">← Admin dashboard</Link><h1 className="mt-8 text-3xl font-black">Player management</h1><p className="mt-2 text-sm text-slate-400">Search accounts, manage roles, suspend access, and adjust points with an audit trail.</p><PlayerManager initial={players.map(p=>({...p,createdAt:p.createdAt.toISOString()}))} actorRole={user.role}/></main>;
}
