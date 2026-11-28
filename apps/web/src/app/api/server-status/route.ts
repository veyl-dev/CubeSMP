import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const host = process.env.MINECRAFT_SERVER_HOST?.trim();
  const port = Number(process.env.MINECRAFT_SERVER_PORT || "25565");
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    return NextResponse.json({ configured: false }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const endpoint = `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(host)}:${port}`;
    const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Minecraft status provider returned ${response.status}`);
    const data = await response.json();
    return NextResponse.json({
      configured: true,
      online: Boolean(data.online),
      players: Number(data.players?.online ?? 0),
      maxPlayers: Number(data.players?.max ?? 0),
      version: typeof data.version?.name_clean === "string" ? data.version.name_clean : null
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ configured: true, online: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
