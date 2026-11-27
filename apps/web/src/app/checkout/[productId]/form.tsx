"use client";
import { FormEvent,useState } from "react";
type Method={method:"GCASH"|"MAYA";accountName:string;accountNumber:string;instructions:string};
export default function CheckoutForm({productId,priceMinor,methods}:{productId:string;priceMinor:number;methods:Method[]}) {
 const [method,setMethod]=useState<"GCASH"|"MAYA"|"">("");
 const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [done,setDone]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  try{
   const form=new FormData(e.currentTarget);const file=form.get("proof");
   if(!(file instanceof File)||!file.size)throw new Error("Upload your payment screenshot.");
   if(file.size>5*1024*1024||!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Use a JPG, PNG, or WebP image up to 5 MB.");
   if(!method)throw new Error("Choose GCash or Maya.");
   const proofForm=new FormData();proofForm.append("proof",file);
   const proofResponse=await fetch("/api/uploads/payment-proof",{method:"POST",body:proofForm});
   const signed=await proofResponse.json();
   if(!proofResponse.ok||!signed.key)throw new Error(signed.error??"Payment proof upload failed.");
   const result=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId,method,referenceNumber:form.get("referenceNumber"),amountMinor:priceMinor,proofObjectKey:signed.key})}).then(async r=>({ok:r.ok,data:await r.json()}));
   if(!result.ok)throw new Error(result.data.error??"Could not submit order.");
   setDone(result.data.orderId);
  }catch(err){setError(err instanceof Error?err.message:"Checkout failed.");}finally{setBusy(false);}
 }
 if(done)return <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6"><h2 className="text-xl font-black text-emerald-300">Payment submitted</h2><p className="mt-2 text-sm text-slate-300">Your order is pending manual administrator verification. Order: {done}</p></div>;
 return <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-panel p-6"><h2 className="text-lg font-black">Payment details</h2>{methods.length===0&&<p className="text-sm text-amber-300">No payment methods are currently configured. Contact the server owner.</p>}<div className="grid gap-3 sm:grid-cols-2">{methods.map(m=><button type="button" key={m.method} onClick={()=>setMethod(m.method)} className={`rounded-xl border p-4 text-left ${method===m.method?"border-sky-400 bg-sky-400/10":"border-white/10"}`}><strong>{m.method}</strong><p className="mt-1 text-sm text-slate-400">{m.accountName}</p><p className="text-sm text-slate-400">{m.accountNumber}</p><p className="mt-2 text-xs text-slate-500">{m.instructions}</p></button>)}</div><label className="block text-sm font-semibold">Payment reference number<input name="referenceNumber" required minLength={4} maxLength={100} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3"/></label><label className="block text-sm font-semibold">Payment screenshot<input name="proof" type="file" accept="image/jpeg,image/png,image/webp" required className="mt-2 block w-full text-sm text-slate-400"/></label><p className="text-xs leading-5 text-slate-500">Your screenshot is stored privately and reviewed by an administrator. Uploading proof does not automatically verify or approve your payment.</p>{error&&<p className="text-sm text-red-400">{error}</p>}<button disabled={busy||methods.length===0} className="w-full rounded-xl bg-brand-gradient px-4 py-3 font-extrabold disabled:opacity-50">{busy?"Submitting…":"Submit for verification"}</button></form>;
}
