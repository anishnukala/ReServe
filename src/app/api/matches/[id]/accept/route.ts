import { NextResponse } from "next/server";
import type { Donation } from "@/types/donation";
import type { MatchResult } from "@/types/match";
import { getMongoClient } from "@/lib/mongodb/client";
import { getCollections, type RescueDocument } from "@/lib/mongodb/collections";
import { mapRescueDocument } from "@/lib/mongodb/mappers";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { match?: MatchResult; donation?: Donation };
    if (!body.match || !body.donation) return NextResponse.json({ error: "Match and donation are required." }, { status: 400 });

    const acceptedAt = new Date();
    const client = await getMongoClient();

    if (!client) {
      return NextResponse.json({
        rescue: {
          id: `rescue-${Date.now()}`,
          donationId: body.donation.id,
          recipientOrgId: body.match.recipient.id,
          status: "ACCEPTED",
          acceptedAt: acceptedAt.toISOString(),
          pickedUpAt: null,
          deliveredAt: null,
          quantityRescued: body.donation.quantityLbs,
        },
        demo: true,
      });
    }

    const collections = getCollections(client.db(process.env.MONGODB_DB || "reserve"));
    const [storedMatch, storedDonation, existingRescue] = await Promise.all([
      collections.matches.findOne({ _id: id, donationId: body.donation.id }),
      collections.donations.findOne({ _id: body.donation.id }),
      collections.rescues.findOne({ donationId: body.donation.id }),
    ]);
    if (!storedMatch || !storedDonation) {
      return NextResponse.json({ error: "Match or donation not found." }, { status: 404 });
    }
    if (existingRescue) return NextResponse.json({ rescue: mapRescueDocument(existingRescue) });

    const rescue: RescueDocument = {
      _id: `rescue-${crypto.randomUUID()}`,
      donationId: storedDonation._id,
      recipientOrgId: storedMatch.recipientOrgId,
      status: "ACCEPTED",
      acceptedAt,
      pickedUpAt: null,
      deliveredAt: null,
      quantityRescued: storedDonation.quantityLbs,
    };
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await collections.matches.updateOne({ _id: id }, { $set: { status: "ACCEPTED" } }, { session });
        await collections.donations.updateOne({ _id: storedDonation._id }, { $set: { status: "ACCEPTED" } }, { session });
        await collections.rescues.insertOne(rescue, { session });
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({ rescue: mapRescueDocument(rescue) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to accept match." }, { status: 500 });
  }
}
