import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email().max(254),
  minecraftName: z.string().regex(/^[A-Za-z0-9_]{3,16}$/),
  password: z.string().min(12).max(128)
});
export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { email: body.email.toLowerCase(), minecraftName: body.minecraftName, passwordHash }
    });
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, email: user.email, minecraftName: user.minecraftName, role: user.role } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid registration details", fields: error.flatten() }, { status: 400 });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "Email or Minecraft username is already registered" }, { status: 409 });
    return NextResponse.json({ error: "Unable to register" }, { status: 500 });
  }
}
