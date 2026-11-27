"use client";
import { useState } from "react";
export function ReviewButton({id,decision}:{id:string;decision:"approve"|"reject"}) {
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 async function run(){
  const reason=decision==="reject"?window.prompt("Reason for rejection?"):"";
  if(decision==="reject"&&!reason)return;
  setBusy(true);
  const response=await fetch(`/api/admin/payments/${id}/review`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(decision==="approve"?{decision}:{decision,reason})});
  const data=await response.json();setBusy(false);setMessage(response.ok?"Updated":data.error??"Failed");
  if(response.ok)window.location.reload();
 }
 return <div><button onClick={run} disabled={busy} className={decision==="approve"?"rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300":"rounded-lg bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300"}>{busy?"Working…":decision==="approve"?"Approve":"Reject"}</button>{message&&<span className="ml-2 text-xs text-slate-400">{message}</span>}</div>;
}
