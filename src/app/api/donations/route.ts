import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections, type DonationDocument } from "@/lib/mongodb/collections";
import { mapDonationDocument } from "@/lib/mongodb/mappers";

const donationSchema = z.object({
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
  donorSafetyConfirmed: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const body = donationSchema.parse(await request.json());
    const now = new Date();

    if (new Date(body.pickupDeadline).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Pickup deadline must be in the future." }, { status: 400 });
    }

    const db = await getMongoDatabase();
    if (!db) {
      return NextResponse.json({
        donation: {
          id: `demo-${Date.now()}`,
          donorOrgId: null,
          ...body,
          status: "AVAILABLE",
          createdAt: now.toISOString(),
        },
        demo: true,
      });
    }

    const donation: DonationDocument = {
        _id: crypto.randomUUID(),
        donorOrgId: null,
        foodName: body.foodName,
        foodCategory: body.foodCategory,
        quantityLbs: body.quantityLbs,
        storageType: body.storageType,
        allergens: body.allergens,
        dietaryTags: body.dietaryTags,
        preparedAt: body.preparedAt ? new Date(body.preparedAt) : null,
        pickupDeadline: new Date(body.pickupDeadline),
        latitude: body.latitude,
        longitude: body.longitude,
        donorSafetyConfirmed: body.donorSafetyConfirmed,
        status: "AVAILABLE",
        createdAt: now,
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
