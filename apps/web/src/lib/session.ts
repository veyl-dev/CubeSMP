import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "cubesmp_session";
export function assertSessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return value;
}
const secret = assertSessionSecret;
const sign = (id: string) => createHmac("sha256", secret()).update(id).digest("hex");
export async function createSession(userId: string) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await prisma.session.create({ data: { id, userId, expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE, id + "." + sign(id), {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", expires: expiresAt
  });
}
export async function getSessionUser() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const [id, signature] = raw.split(".");
  if (!id || !signature) return null;
  const expected = Buffer.from(sign(id), "hex");
  let supplied: Buffer;
  try { supplied = Buffer.from(signature, "hex"); } catch { return null; }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  const session = await prisma.session.findUnique({
    where: { id }, include: { user: true }
  });
  if (!session || session.expiresAt < new Date() || session.user.suspended) return null;
  return session.user;
}
export async function destroySession() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (raw) {
    const id = raw.split(".")[0];
    if (id) await prisma.session.deleteMany({ where: { id } });
  }
  jar.delete(COOKIE);
}
