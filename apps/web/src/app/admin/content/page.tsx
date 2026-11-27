import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ContentEditor from "./content-editor";
export default async function ContentPage(){
 const user=await getSessionUser();if(!user)redirect("/login");if(user.role!=="OWNER")redirect("/admin");
 const settings=await prisma.websiteSetting.findMany();
 const values=Object.fromEntries(settings.map(s=>[s.key,typeof s.value==="string"?s.value:JSON.stringify(s.value)]));
 return <main className="mx-auto min-h-screen max-w-4xl px-5 py-10"><Link href="/admin" className="text-sm font-bold text-sky-400">← Admin dashboard</Link><h1 className="mt-8 text-3xl font-black">Website content</h1><p className="mt-2 text-sm text-slate-400">Changes are stored in the database and read by the public website.</p><ContentEditor initial={values}/></main>;
}
