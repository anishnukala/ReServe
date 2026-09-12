import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { searchAndRank } from "@/lib/ai/search";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";
import { mapDonationDocument } from "@/lib/mongodb/mappers";

const schema = z.object({ donationId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const auth = await requireUser(["restaurant", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { donationId } = schema.parse(await request.json());
    const db = await getMongoDatabase();
    if (!db) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    const collections = getCollections(db);
    const document = await collections.donations.findOne({ _id: donationId });
    if (!document) return NextResponse.json({ error: "Donation not found." }, { status: 404 });
    if (auth.user.role !== "admin" && document.donorUserId !== auth.user._id) return NextResponse.json({ error: "You do not own this donation." }, { status: 403 });
    if (document.selectedMatchId) return NextResponse.json({ error: "An organization has already been requested for this donation." }, { status: 409 });
    const donation = mapDonationDocument(document);
    const matches = await searchAndRank(db, donation, 5);

    if (matches.length) {
      const createdAt = new Date();
      await collections.matches.bulkWrite(matches.map((match) => ({ updateOne: {
        filter: { _id: match.id },
        update: { $set: { donationId, recipientOrgId: match.organizationId, distanceMiles: match.distanceMiles, finalScore: match.matchScore, aiSimilarity: match.aiSimilarity, breakdown: match.breakdown, reasons: match.reasons, explanation: match.explanation, status: "SUGGESTED" as const }, $setOnInsert: { createdAt } },
        upsert: true,
      } })));
      await collections.donations.updateOne({ _id: donationId }, { $set: { status: "MATCHED", updatedAt: new Date() } });
    }
    return NextResponse.json({ donation: { ...donation, status: matches.length ? "MATCHED" : donation.status }, matches });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid search." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Unable to search for compatible organizations." }, { status: 500 });
  }
}
