import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, createSessionToken, publicUser, SESSION_MAX_AGE } from "@/lib/auth/session";
import { getMongoClient } from "@/lib/mongodb/client";
import { getCollections, type OrganizationDocument, type UserDocument } from "@/lib/mongodb/collections";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30).optional().or(z.literal("")),
  password: z.string().min(8).max(128),
  role: z.enum(["restaurant", "food_org"]),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const client = await getMongoClient();
    if (!client) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    const collections = getCollections(client.db(process.env.MONGODB_DB || "reserve"));
    const email = input.email.toLowerCase();
    if (await collections.users.findOne({ email })) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const now = new Date();
    const userId = crypto.randomUUID();
    const organizationId = input.role === "food_org" ? crypto.randomUUID() : null;
    const user: UserDocument = { _id: userId, name: input.name, email, phone: input.phone || null, passwordHash: await hash(input.password, 12), role: input.role, status: "ACTIVE", organizationId, createdAt: now, updatedAt: now };
    const organization: OrganizationDocument | null = organizationId ? {
      _id: organizationId, ownerUserId: userId, name: input.name, description: "", type: "NONPROFIT", address: "", phone: input.phone || null,
      acceptedCategories: [], dietaryPreferences: [], storageCapabilities: [], maximumCapacityLbs: 0, availableCapacityLbs: 0,
      pickupAvailable: false, receivingHours: { openHour: 8, closeHour: 17 }, rating: 0, verified: false, status: "INCOMPLETE", createdAt: now, updatedAt: now,
    } : null;

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await collections.users.insertOne(user, { session });
        if (organization) await collections.organizations.insertOne(organization, { session });
      });
    } finally { await session.endSession(); }

    const response = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    response.cookies.set(AUTH_COOKIE, await createSessionToken(user), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid signup details." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
