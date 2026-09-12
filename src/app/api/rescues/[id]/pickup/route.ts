import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";
import { mapRescueDocument } from "@/lib/mongodb/mappers";
import { requireUser } from "@/lib/auth/session";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser(["food_org", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const pickedUpAt = new Date();
    const client = await getMongoClient();

    if (!client) {
      return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    }

    const collections = getCollections(client.db(process.env.MONGODB_DB || "reserve"));
    const rescue = await collections.rescues.findOne({ _id: id });
    if (!rescue) return NextResponse.json({ error: "Rescue not found." }, { status: 404 });
    if (auth.user.role !== "admin" && rescue.recipientOrgId !== auth.user.organizationId) return NextResponse.json({ error: "This rescue belongs to another organization." }, { status: 403 });
    if (rescue.status === "DELIVERED") return NextResponse.json({ error: "Delivered rescues cannot be changed." }, { status: 409 });

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await collections.rescues.updateOne({ _id: id }, { $set: { status: "PICKED_UP", pickedUpAt } }, { session });
        await collections.donations.updateOne({ _id: rescue.donationId }, { $set: { status: "PICKED_UP", updatedAt: pickedUpAt } }, { session });
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({ rescue: mapRescueDocument({ ...rescue, status: "PICKED_UP", pickedUpAt }) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to mark pickup." }, { status: 500 });
  }
}
