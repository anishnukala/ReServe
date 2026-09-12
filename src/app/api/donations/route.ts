import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections, type DonationDocument } from "@/lib/mongodb/collections";
import { mapDonationDocument } from "@/lib/mongodb/mappers";
import { requireUser } from "@/lib/auth/session";

const donationSchema = z.object({
  description: z.string().trim().min(3).max(1000),
  foodName: z.string().min(2).max(120),
  foodCategory: z.string().min(2).max(60),
  quantityLbs: z.number().positive().max(100000),
  storageType: z.enum(["ambient", "refrigerated", "frozen"]),
  allergens: z.array(z.string()).default([]),
  dietaryTags: z.array(z.string()).default([]),
  preparedAt: z.string().nullable().optional(),
  pickupDeadline: z.string().datetime(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().trim().max(250).nullable().optional(),
  searchRadiusMiles: z.number().refine((value) => [5, 10, 15, 25].includes(value), "Invalid search radius."),
  donorSafetyConfirmed: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const auth = await requireUser(["restaurant", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const body = donationSchema.parse(await request.json());
    const now = new Date();

    if (new Date(body.pickupDeadline).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Pickup deadline must be in the future." }, { status: 400 });
    }

    const db = await getMongoDatabase();
    if (!db) {
      return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    }

    const donation: DonationDocument = {
        _id: crypto.randomUUID(),
        donorUserId: auth.user._id,
        donorOrganizationId: auth.user.organizationId ?? null,
        donorOrgId: null,
        description: body.description,
        foodName: body.foodName,
        foodCategory: body.foodCategory,
        quantityLbs: body.quantityLbs,
        storageType: body.storageType,
        allergens: body.allergens,
        dietaryTags: body.dietaryTags,
        preparedAt: body.preparedAt ? new Date(body.preparedAt) : null,
        pickupDeadline: new Date(body.pickupDeadline),
        location: { type: "Point", coordinates: [body.longitude, body.latitude] },
        address: body.address ?? null,
        searchRadiusMiles: body.searchRadiusMiles,
        selectedOrganizationId: null,
        selectedMatchId: null,
        donorSafetyConfirmed: body.donorSafetyConfirmed,
        status: "AVAILABLE",
        createdAt: now,
        updatedAt: now,
    };

    await getCollections(db).donations.insertOne(donation);
    return NextResponse.json({ donation: mapDonationDocument(donation) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid donation." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to create donation." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = await requireUser(["restaurant", "food_org", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const db = await getMongoDatabase();
    if (!db) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });

    const filter: import("mongodb").Filter<import("@/lib/mongodb/collections").DonationDocument> = auth.user.role === "restaurant" ? { donorUserId: auth.user._id } : { status: { $in: ["AVAILABLE", "MATCHED"] } };
    const documents = await getCollections(db).donations
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ donations: documents.map(mapDonationDocument) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load donations." }, { status: 500 });
  }
}
