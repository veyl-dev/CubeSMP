import { getSessionUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function requireRoles(roles: string[]) {
  const user = await getSessionUser();
  if (!user) return { user: null, response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  if (!roles.includes(user.role)) return { user: null, response: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  return { user, response: null };
}
