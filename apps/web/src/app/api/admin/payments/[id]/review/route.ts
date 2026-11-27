import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authz";

const schema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({ decision: z.literal("reject"), reason: z.string().min(3).max(500) })
]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(["OWNER", "ADMIN"]);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  let input;
  try { input = schema.parse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid review request" }, { status: 400 }); }

  try {
    const result = await prisma.$transaction(async tx => {
      const payment = await tx.paymentTransaction.findUnique({ where: { id }, include: { order: true } });
      if (!payment) throw new Error("NOT_FOUND");
      if (payment.status !== "PENDING") throw new Error("ALREADY_REVIEWED");
      if (payment.order.userId === auth.user!.id) throw new Error("SELF_REVIEW");
      const updated = await tx.paymentTransaction.updateMany({
        where: { id, status: "PENDING" },
        data: {
          status: input.decision === "approve" ? "APPROVED" : "REJECTED",
          rejectionReason: input.decision === "reject" ? input.reason : null,
          reviewedById: auth.user!.id,
          reviewedAt: new Date()
        }
      });
      if (updated.count !== 1) throw new Error("ALREADY_REVIEWED");
      await tx.order.update({ where: { id: payment.orderId }, data: { status: input.decision === "approve" ? "APPROVED" : "REJECTED" } });
      if (input.decision === "approve") {
        await tx.deliveryJob.create({ data: { orderId: payment.orderId, status: "QUEUED" } });
      }
      await tx.auditLog.create({
        data: { actorId: auth.user!.id, action: input.decision === "approve" ? "PAYMENT_APPROVED" : "PAYMENT_REJECTED", entityType: "PaymentTransaction", entityId: id, metadata: input.decision === "reject" ? { reason: input.reason } : undefined }
      });
      return { status: input.decision === "approve" ? "APPROVED" : "REJECTED" };
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NOT_FOUND") return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    if (message === "ALREADY_REVIEWED") return NextResponse.json({ error: "Payment has already been reviewed" }, { status: 409 });
    if (message === "SELF_REVIEW") return NextResponse.json({ error: "You cannot review your own payment" }, { status: 403 });
    return NextResponse.json({ error: "Unable to review payment" }, { status: 500 });
  }
}
