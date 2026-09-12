import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";
import { mapOrganizationDocument } from "@/lib/mongodb/mappers";

const schema = z.object({
  name: z.string().trim().min(2).max(120), description: z.string().trim().min(10).max(1500),
  type: z.enum(["FOOD_PANTRY", "SHELTER", "NONPROFIT"]), address: z.string().trim().min(3).max(250), phone: z.string().trim().max(30).nullable().optional(),
  acceptedCategories: z.array(z.string().min(1)).min(1), dietaryPreferences: z.array(z.string()), storageCapabilities: z.array(z.enum(["ambient", "refrigerated", "frozen"])).min(1),
  maximumCapacityLbs: z.number().nonnegative().max(1_000_000), availableCapacityLbs: z.number().nonnegative().max(1_000_000), pickupAvailable: z.boolean(),
  receivingHours: z.object({ openHour: z.number().int().min(0).max(23), closeHour: z.number().int().min(0).max(23) }),
  latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), rating: z.number().min(0).max(5).default(0),
});

export async function GET() {
  const auth = await requireUser(["food_org", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.user.organizationId) return NextResponse.json({ error: "No organization is linked to this account." }, { status: 404 });
  const db = await getMongoDatabase();
  const organization = db ? await getCollections(db).organizations.findOne({ _id: auth.user.organizationId }) : null;
  if (!organization) return NextResponse.json({ error: "Organization not found." }, { status: 404 });
  return NextResponse.json({ organization: mapOrganizationDocument(organization) });
}

export async function PUT(request: Request) {
  try {
    const auth = await requireUser(["food_org", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    if (!auth.user.organizationId) return NextResponse.json({ error: "No organization is linked to this account." }, { status: 404 });
    const input = schema.parse(await request.json());
    if (input.availableCapacityLbs > input.maximumCapacityLbs) return NextResponse.json({ error: "Available capacity cannot exceed maximum capacity." }, { status: 400 });
    const db = await getMongoDatabase();
    if (!db) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    const collections = getCollections(db);
    await collections.organizations.updateOne({ _id: auth.user.organizationId }, { $set: {
      ...input, location: { type: "Point", coordinates: [input.longitude, input.latitude] }, status: input.pickupAvailable ? "ACTIVE" : "PAUSED", updatedAt: new Date(),
    }, $unset: { embedding: "", embeddingModel: "", embeddingSourceHash: "", embeddingUpdatedAt: "" } });
    const organization = await collections.organizations.findOne({ _id: auth.user.organizationId });
    return NextResponse.json({ organization: organization ? mapOrganizationDocument(organization) : null });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid profile." }, { status: 400 });
    console.error(error); return NextResponse.json({ error: "Unable to update organization." }, { status: 500 });
  }
}
