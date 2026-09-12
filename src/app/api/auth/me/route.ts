import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ user: publicUser(user) });
}
