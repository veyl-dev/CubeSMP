import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ success: z.boolean(), detail: z.string().max(1000).optional() });
function authorized(request: Request) {
  const secret = process.env.BRIDGE_SHARED_SECRET;
  return !!secret && secret.length >= 32 && request.headers.get("authorization") === `Bearer ${secret}`;
}
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  let input;
  try { input = schema.parse(await request.json()); } catch { return NextResponse.json({ error: "Invalid result" }, { status: 400 }); }
  try {
    await prisma.$transaction(async tx => {
      const job = await tx.deliveryJob.findUnique({ where: { id }, include: { order: { include: { user: true, items: { include: { product: true } } } } } });
      if (!job) throw new Error("NOT_FOUND");
      if (job.status !== "CLAIMED") throw new Error("NOT_CLAIMED");
      const retryLimit = Math.max(1, Number(process.env.BRIDGE_MAX_ATTEMPTS ?? 3));
      const nextStatus = input.success ? "SUCCEEDED" : (job.attempts >= retryLimit ? "FAILED" : "QUEUED");
      await tx.deliveryJob.update({ where: { id }, data: { status: nextStatus, lastError: input.success ? null : (input.detail ?? "Delivery failed") } });
      await tx.deliveryLog.create({ data: { jobId: id, event: nextStatus, detail: input.detail } });
      if (input.success) {
        await tx.order.update({ where: { id: job.orderId }, data: { status: "DELIVERED" } });
        await tx.paymentTransaction.updateMany({ where: { orderId: job.orderId, status: "APPROVED" }, data: { status: "DELIVERED" } });
        const points = job.order.items.reduce((sum, item) => sum + (item.product.type === "POINTS" ? (item.product.pointsAmount ?? 0) * item.quantity : 0), 0);
        if (points > 0) {
          await tx.user.update({ where: { id: job.order.userId }, data: { pointsBalance: { increment: points } } });
          await tx.pointLedger.create({ data: { userId: job.order.userId, delta: points, reason: "Store purchase delivery", referenceId: job.id } });
        }
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NOT_FOUND") return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (message === "NOT_CLAIMED") return NextResponse.json({ error: "Job is not currently claimed" }, { status: 409 });
    return NextResponse.json({ error: "Unable to record delivery result" }, { status: 500 });
  }
}
