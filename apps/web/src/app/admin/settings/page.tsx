import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import PaymentSettings from "./payment-settings";
export default async function SettingsPage(){
 const user=await getSessionUser();if(!user)redirect("/login");if(user.role!=="OWNER")redirect("/admin");
 const current=await prisma.paymentMethodSetting.findMany();
 return <main className="mx-auto min-h-screen max-w-4xl px-5 py-10"><Link href="/admin" className="text-sm font-bold text-sky-400">← Admin dashboard</Link><h1 className="mt-8 text-3xl font-black">Payment settings</h1><p className="mt-2 text-sm text-slate-400">Only the Owner can change payment account details.</p><PaymentSettings initial={current.map(x=>({method:x.method,accountName:x.accountName,accountNumber:x.accountNumber,instructions:x.instructions,enabled:x.enabled,qrObjectKey:x.qrObjectKey}))}/></main>;
}
