"use client";

import { useEffect, useState } from "react";

type Status = { configured: boolean; online?: boolean; players?: number; maxPlayers?: number; version?: string };
export default function ServerStatus() {
  const [status, setStatus] = useState<Status>({ configured: false });
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const response = await fetch("/api/server-status", { cache: "no-store" });
        const data = await response.json();
        if (active) setStatus(data);
      } catch {
        if (active) setStatus({ configured: true, online: false });
      } finally { if (active) setChecked(true); }
    };
    void check();
    const timer = window.setInterval(check, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  if (!status.configured) return <span className="text-xs text-slate-500">Live status needs server host and port configuration.</span>;
  return <div className="flex items-center gap-2 text-xs font-bold">
    <span className={`h-2.5 w-2.5 rounded-full ${status.online ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" : "bg-rose-400"}`} />
    <span className={status.online ? "text-emerald-300" : "text-rose-300"}>{!checked ? "Checking server…" : status.online ? "ONLINE" : "OFFLINE"}</span>
    {status.online && <span className="font-medium text-slate-400">{status.players ?? 0}/{status.maxPlayers ?? 0} players</span>}
  </div>;
}
