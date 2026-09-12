import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getMongoClient } from "@/lib/mongodb/client";
import { getCollections, type OrganizationNeedDocument } from "@/lib/mongodb/collections";

const needSchema = z.object({ foodCategory: z.string().min(1).max(60), desiredQuantityLbs: z.number().positive(), currentQuantityLbs: z.number().nonnegative(), urgencyScore: z.number().min(0).max(100), storageType: z.enum(["ambient", "refrigerated", "frozen"]), dietaryTags: z.array(z.string()), neededUntil: z.string().datetime(), active: z.boolean() });

export async function GET() {
  const auth = await requireUser(["food_org", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.user.organizationId) return NextResponse.json({ needs: [] });
  const client = await getMongoClient();
  const needs = client ? await getCollections(client.db(process.env.MONGODB_DB || "reserve")).organizationNeeds.find({ organizationId: auth.user.organizationId }).sort({ updatedAt: -1 }).toArray() : [];
  return NextResponse.json({ needs: needs.map((need) => ({ ...need, id: need._id, neededUntil: need.neededUntil.toISOString(), updatedAt: need.updatedAt.toISOString(), _id: undefined })) });
}

export async function PUT(request: Request) {
  try {
    const auth = await requireUser(["food_org", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    if (!auth.user.organizationId) return NextResponse.json({ error: "No organization is linked to this account." }, { status: 404 });
    const organizationId = auth.user.organizationId;
    const inputs = z.array(needSchema).max(25).parse(await request.json());
    const client = await getMongoClient();
    if (!client) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    const collections = getCollections(client.db(process.env.MONGODB_DB || "reserve"));
    const now = new Date();
    const documents: OrganizationNeedDocument[] = inputs.map((input) => ({ _id: crypto.randomUUID(), organizationId, ...input, neededUntil: new Date(input.neededUntil), updatedAt: now }));
    const session = client.startSession();
    try { await session.withTransaction(async () => {
      await collections.organizationNeeds.deleteMany({ organizationId }, { session });
      if (documents.length) await collections.organizationNeeds.insertMany(documents, { session });
      await collections.organizations.updateOne({ _id: organizationId }, { $set: { updatedAt: now }, $unset: { embedding: "", embeddingModel: "", embeddingSourceHash: "", embeddingUpdatedAt: "" } }, { session });
    }); } finally { await session.endSession(); }
    return NextResponse.json({ count: documents.length });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid needs." }, { status: 400 });
    console.error(error); return NextResponse.json({ error: "Unable to update needs." }, { status: 500 });
  }
}
