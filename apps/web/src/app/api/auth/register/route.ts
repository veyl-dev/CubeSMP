import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assertSessionSecret, createSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email().max(254),
  minecraftName: z.string().regex(/^[A-Za-z0-9_]{3,16}$/),
  password: z.string().min(12).max(128)
});
export async function POST(request: Request) {
  try {
    // Fail before creating a user if the session signing secret is missing.
    assertSessionSecret();
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();
    const minecraftName = body.minecraftName;
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { email, minecraftName, passwordHash }
    });
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, email: user.email, minecraftName: user.minecraftName, role: user.role } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid registration details", fields: error.flatten() }, { status: 400 });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "Email or Minecraft username is already registered" }, { status: 409 });
    console.error("[CubeSMP auth/register]", error);
    return NextResponse.json({ error: "Unable to register. Check the server configuration and try again." }, { status: 500 });
  }
}
