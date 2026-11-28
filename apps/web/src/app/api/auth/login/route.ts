import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assertSessionSecret, createSession } from "@/lib/session";

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });
export async function POST(request: Request) {
  try {
    assertSessionSecret();
    const body = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || user.suspended || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, email: user.email, minecraftName: user.minecraftName, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid login details" }, { status: 400 });
    console.error("[CubeSMP auth/login]", error);
    return NextResponse.json({ error: "Unable to log in. Check the server configuration and try again." }, { status: 500 });
  }
}
