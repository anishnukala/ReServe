import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections, type OrganizationDocument } from "@/lib/mongodb/collections";
import { mapOrganizationDocument } from "@/lib/mongodb/mappers";

const schema = z.object({ latitude: z.coerce.number().min(-90).max(90), longitude: z.coerce.number().min(-180).max(180), radius: z.coerce.number().min(1).max(50).default(10), query: z.string().trim().max(80).optional() });
type NearbyDocument = OrganizationDocument & { distanceMeters: number };

export async function GET(request: Request) {
  try {
    const input = schema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const db = await getMongoDatabase();
    if (!db) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    const documents = await getCollections(db).organizations.aggregate<NearbyDocument>([
      { $geoNear: { near: { type: "Point", coordinates: [input.longitude, input.latitude] }, key: "location", distanceField: "distanceMeters", maxDistance: input.radius * 1609.344, spherical: true, query: { status: "ACTIVE" } } },
      ...(input.query ? [{ $match: { $or: [{ name: { $regex: input.query, $options: "i" } }, { description: { $regex: input.query, $options: "i" } }, { acceptedCategories: { $regex: input.query, $options: "i" } }] } }] : []),
      { $limit: 50 },
    ]).toArray();
    const needs = await getCollections(db).organizationNeeds.find({ organizationId: { $in: documents.map((item) => item._id) }, active: true, neededUntil: { $gte: new Date() } }).toArray();
    return NextResponse.json({ organizations: documents.map((document) => ({ ...mapOrganizationDocument(document), distanceMiles: Number((document.distanceMeters / 1609.344).toFixed(1)), currentNeeds: needs.filter((need) => need.organizationId === document._id).map((need) => ({ foodCategory: need.foodCategory, urgencyScore: need.urgencyScore })), profileComplete: Boolean(document.description && document.acceptedCategories.length && document.storageCapabilities.length && document.location) })) });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid location." }, { status: 400 });
    console.error(error); return NextResponse.json({ error: "Unable to find nearby organizations." }, { status: 500 });
  }
}
