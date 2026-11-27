import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import AccountSettings from "./account-settings";
export default async function AccountSettingsPage(){
 const user=await getSessionUser();if(!user)redirect("/login");
 return <main className="mx-auto min-h-screen max-w-2xl px-5 py-10"><Link href="/dashboard" className="text-sm font-bold text-sky-400">← Player dashboard</Link><h1 className="mt-8 text-3xl font-black">Account settings</h1><p className="mt-2 text-sm text-slate-400">{user.email}</p><AccountSettings minecraftName={user.minecraftName}/></main>;
}
