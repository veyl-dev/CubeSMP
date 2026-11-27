import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });
export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || user.suspended || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, email: user.email, minecraftName: user.minecraftName, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid login details" }, { status: 400 });
    return NextResponse.json({ error: "Unable to log in" }, { status: 500 });
  }
}
