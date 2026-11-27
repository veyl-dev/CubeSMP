import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function authorized(request: Request) {
  const secret = process.env.BRIDGE_SHARED_SECRET;
  const header = request.headers.get("authorization");
  return !!secret && secret.length >= 32 && header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const job = await prisma.deliveryJob.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    include: { order: { include: { user: true, items: { include: { product: true } } } } }
  });
  if (!job) return NextResponse.json({ job: null });
  const claimed = await prisma.deliveryJob.updateMany({
    where: { id: job.id, status: "QUEUED" },
    data: { status: "CLAIMED", claimedAt: new Date(), attempts: { increment: 1 } }
  });
  if (claimed.count !== 1) return NextResponse.json({ job: null });
  const commands = job.order.items.flatMap(item => {
    const raw = item.product.deliveryCommands;
    if (!Array.isArray(raw)) return [];
    return raw.filter((v): v is string => typeof v === "string").map(command =>
      command.replaceAll("{player}", job.order.user.minecraftName)
        .replaceAll("{amount}", String(item.product.pointsAmount ?? item.quantity))
        .replaceAll("{rank}", item.product.rankKey ?? item.product.name)
    );
  });
  await prisma.deliveryLog.create({ data: { jobId: job.id, event: "CLAIMED", detail: "Claimed by bridge" } });
  return NextResponse.json({ job: { id: job.id, player: job.order.user.minecraftName, commands } });
}
