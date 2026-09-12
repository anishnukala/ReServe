import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getMongoClient } from "@/lib/mongodb/client";
import { getCollections, type RescueDocument } from "@/lib/mongodb/collections";
import { mapDonationDocument, mapRescueDocument } from "@/lib/mongodb/mappers";

const schema = z.object({ action: z.enum(["accept", "decline"]) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser(["food_org", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const input = schema.parse(await request.json());
    const { id } = await context.params;
    const client = await getMongoClient();
    if (!client) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    const collections = getCollections(client.db(process.env.MONGODB_DB || "reserve"));
    const match = await collections.matches.findOne({ _id: id, status: "SELECTED" });
    if (!match) return NextResponse.json({ error: "Selected match not found." }, { status: 404 });
    if (auth.user.role !== "admin" && auth.user.organizationId !== match.recipientOrgId) return NextResponse.json({ error: "This match belongs to another organization." }, { status: 403 });
    const donation = await collections.donations.findOne({ _id: match.donationId, selectedMatchId: id });
    if (!donation) return NextResponse.json({ error: "Donation not found." }, { status: 404 });

    if (input.action === "decline") {
      const session = client.startSession();
      try { await session.withTransaction(async () => {
        await collections.matches.updateOne({ _id: id }, { $set: { status: "DECLINED" } }, { session });
        await collections.donations.updateOne({ _id: donation._id }, { $set: { status: "AVAILABLE", selectedMatchId: null, selectedOrganizationId: null, updatedAt: new Date() } }, { session });
      }); } finally { await session.endSession(); }
      return NextResponse.json({ status: "DECLINED" });
    }

    const acceptedAt = new Date();
    const rescue: RescueDocument = { _id: `rescue-${crypto.randomUUID()}`, donationId: donation._id, recipientOrgId: match.recipientOrgId, donorUserId: donation.donorUserId, status: "ACCEPTED", acceptedAt, pickedUpAt: null, deliveredAt: null, quantityRescued: donation.quantityLbs };
    const session = client.startSession();
    try { await session.withTransaction(async () => {
      await collections.matches.updateOne({ _id: id }, { $set: { status: "ACCEPTED" } }, { session });
      await collections.donations.updateOne({ _id: donation._id }, { $set: { status: "ACCEPTED", updatedAt: acceptedAt } }, { session });
      await collections.rescues.insertOne(rescue, { session });
    }); } finally { await session.endSession(); }
    return NextResponse.json({ rescue: mapRescueDocument(rescue), donation: mapDonationDocument({ ...donation, status: "ACCEPTED", updatedAt: acceptedAt }) });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Choose accept or decline." }, { status: 400 });
    console.error(error); return NextResponse.json({ error: "Unable to respond to match." }, { status: 500 });
  }
}
