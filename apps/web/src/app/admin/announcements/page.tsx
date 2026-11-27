import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AnnouncementManager from "./announcement-manager";
export default async function AnnouncementsPage(){
 const user=await getSessionUser();if(!user)redirect("/login");if(!["OWNER","ADMIN"].includes(user.role))redirect("/admin");
 const items=await prisma.announcement.findMany({orderBy:{createdAt:"desc"},take:100});
 return <main className="mx-auto min-h-screen max-w-5xl px-5 py-10"><Link href="/admin" className="text-sm font-bold text-sky-400">← Admin dashboard</Link><h1 className="mt-8 text-3xl font-black">Announcements</h1><AnnouncementManager initial={items.map(x=>({...x,createdAt:x.createdAt.toISOString()}))}/></main>;
}
