import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, createSessionToken, publicUser, SESSION_MAX_AGE } from "@/lib/auth/session";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";

const schema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const db = await getMongoDatabase();
    if (!db) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    const user = await getCollections(db).users.findOne({ email: input.email.toLowerCase() });
    if (!user || !(await compare(input.password, user.passwordHash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    if (user.status !== "ACTIVE") return NextResponse.json({ error: "This account is not active." }, { status: 403 });
    const response = NextResponse.json({ user: publicUser(user) });
    response.cookies.set(AUTH_COOKIE, await createSessionToken(user), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid login details." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 });
  }
}
