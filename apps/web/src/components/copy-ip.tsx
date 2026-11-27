"use client";
import { useState } from "react";
import { Copy,Check } from "lucide-react";
export default function CopyIp({value}:{value:string}){
 const [copied,setCopied]=useState(false);
 async function copy(){try{await navigator.clipboard.writeText(value);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{setCopied(false)}}
 return <button onClick={copy} className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2.5 text-sm font-bold text-sky-300 hover:bg-sky-400/20">{copied?<Check size={15}/>:<Copy size={15}/>} {copied?"Copied":"Copy server IP"}</button>;
}
