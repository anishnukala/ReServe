import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";
import { mapRescueDocument } from "@/lib/mongodb/mappers";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const deliveredAt = new Date();
    const client = await getMongoClient();

    if (!client) {
      return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    }

    const collections = getCollections(client.db(process.env.MONGODB_DB || "reserve"));
    const rescue = await collections.rescues.findOne({ _id: id });
    if (!rescue) return NextResponse.json({ error: "Rescue not found." }, { status: 404 });
    if (rescue.status === "ACCEPTED") return NextResponse.json({ error: "Mark the rescue as picked up before delivery." }, { status: 409 });

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await collections.rescues.updateOne({ _id: id }, { $set: { status: "DELIVERED", deliveredAt } }, { session });
        await collections.donations.updateOne({ _id: rescue.donationId }, { $set: { status: "DELIVERED" } }, { session });
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({ rescue: mapRescueDocument({ ...rescue, status: "DELIVERED", deliveredAt }) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to mark delivery." }, { status: 500 });
  }
}
