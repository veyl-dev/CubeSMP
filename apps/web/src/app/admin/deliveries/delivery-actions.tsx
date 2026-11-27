"use client";
import { useState } from "react";
export default function DeliveryActions({id}:{id:string}){
 const [message,setMessage]=useState("");
 async function retry(){if(!window.confirm("Only retry after checking the Minecraft server logs. Continue?"))return;const r=await fetch("/api/admin/deliveries/"+id+"/retry",{method:"POST"});const d=await r.json();setMessage(r.ok?"Requeued":d.error??"Retry failed");if(r.ok)window.location.reload();}
 return <div className="mt-4"><button onClick={retry} className="rounded-lg bg-amber-400/15 px-3 py-2 text-xs font-bold text-amber-300">Retry failed delivery</button>{message&&<span className="ml-3 text-xs text-slate-400">{message}</span>}</div>;
}
