"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const router=useRouter();
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form=new FormData(event.currentTarget);
    if(form.get("password")!==form.get("confirmPassword")){setBusy(false);setError("Passwords do not match");return;}
    const response=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:form.get("email"),minecraftName:form.get("minecraftName"),password:form.get("password")})});
    const data=await response.json(); setBusy(false);
    if(!response.ok){setError(data.error??"Registration failed");return;}
    router.push("/dashboard"); router.refresh();
  }
  return <main className="grid min-h-screen place-items-center px-5 py-12"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-panel p-8"><Link href="/" className="text-sm font-black text-sky-400">CUBESMP</Link><h1 className="mt-7 text-3xl font-black">Create your account</h1><p className="mt-2 text-sm text-slate-400">Join the CubeSMP community.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-semibold">Minecraft username<input name="minecraftName" required minLength={3} maxLength={16} pattern="[A-Za-z0-9_]+" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-sky-400"/></label><label className="block text-sm font-semibold">Email<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-sky-400"/></label><label className="block text-sm font-semibold">Password<input name="password" type="password" required minLength={12} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-sky-400"/><span className="mt-1 block text-xs text-slate-500">Use at least 12 characters.</span></label><label className="block text-sm font-semibold">Confirm password<input name="confirmPassword" type="password" required minLength={12} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-sky-400"/></label>{error&&<p className="text-sm text-red-400">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-brand-gradient px-4 py-3 font-extrabold disabled:opacity-50">{busy?"Creating account…":"Create account"}</button></form><p className="mt-6 text-center text-sm text-slate-400">Already registered? <Link href="/login" className="font-bold text-sky-400">Log in</Link></p></div></main>;
}
