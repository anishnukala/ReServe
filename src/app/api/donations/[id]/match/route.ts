import { NextResponse } from "next/server";
import type { Organization, RecipientPreference } from "@/types/organization";
import { rankRecipients } from "@/lib/matching/matcher";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";
import { mapDonationDocument, mapOrganizationDocument, mapPreferenceDocument } from "@/lib/mongodb/mappers";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = await getMongoDatabase();
    if (!db) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });

    const document = await getCollections(db).donations.findOne({ _id: id });
    if (!document) return NextResponse.json({ error: "Donation not found." }, { status: 404 });
    const donation = mapDonationDocument(document);

    const collections = getCollections(db);
    const [orgRows, prefRows] = await Promise.all([
      collections.organizations.find().toArray(),
      collections.recipientPreferences.find().toArray(),
    ]);
    const organizations: Organization[] = orgRows.map(mapOrganizationDocument);
    const preferences: RecipientPreference[] = prefRows.map(mapPreferenceDocument);

    const matches = rankRecipients(donation, organizations, preferences);

    if (matches.length) {
      const createdAt = new Date();
      await collections.matches.bulkWrite(matches.map((match) => ({
        updateOne: {
          filter: { _id: match.id },
          update: {
            $set: {
              donationId: donation.id,
              recipientOrgId: match.recipient.id,
              distanceMiles: match.distanceMiles,
              finalScore: match.finalScore,
              breakdown: match.breakdown,
              reasons: match.reasons,
              explanation: match.explanation,
              status: "SUGGESTED" as const,
            },
            $setOnInsert: { createdAt },
          },
          upsert: true,
        },
      })));
      await collections.donations.updateOne({ _id: donation.id }, { $set: { status: "MATCHED" } });
    }

    return NextResponse.json({ donation: { ...donation, status: matches.length ? "MATCHED" : donation.status }, matches });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to rank recipients." }, { status: 500 });
  }
}
