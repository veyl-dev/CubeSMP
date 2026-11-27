"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const router=useRouter();
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form=new FormData(event.currentTarget);
    const response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:form.get("email"),password:form.get("password")})});
    const data=await response.json(); setBusy(false);
    if(!response.ok){setError(data.error??"Login failed");return;}
    router.push(data.user.role==="OWNER"||data.user.role==="ADMIN"||data.user.role==="MODERATOR"?"/admin":"/dashboard"); router.refresh();
  }
  return <main className="grid min-h-screen place-items-center px-5 py-12"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-panel p-8"><Link href="/" className="text-sm font-black text-sky-400">CUBESMP</Link><h1 className="mt-7 text-3xl font-black">Welcome back</h1><p className="mt-2 text-sm text-slate-400">Log in to manage your CubeSMP account.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-semibold">Email<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-sky-400"/></label><label className="block text-sm font-semibold">Password<input name="password" type="password" required className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-sky-400"/></label>{error&&<p className="text-sm text-red-400">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-brand-gradient px-4 py-3 font-extrabold disabled:opacity-50">{busy?"Signing in…":"Log in"}</button></form><p className="mt-6 text-center text-sm text-slate-400">New to CubeSMP? <Link href="/register" className="font-bold text-sky-400">Create an account</Link></p></div></main>;
}
