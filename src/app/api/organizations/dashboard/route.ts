import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";

export async function GET() {
  const auth = await requireUser(["food_org", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const organizationId = auth.user.organizationId;
  if (!organizationId) return NextResponse.json({ error: "No organization is linked to this account." }, { status: 404 });
  const db = await getMongoDatabase(); if (!db) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
  const collections = getCollections(db);
  const [incomingMatches, pendingDonations, acceptedDonations, completedRescues] = await Promise.all([
    collections.matches.countDocuments({ recipientOrgId: organizationId, status: "SUGGESTED" }),
    collections.donations.countDocuments({ selectedOrganizationId: organizationId, status: "MATCHED" }),
    collections.donations.countDocuments({ selectedOrganizationId: organizationId, status: { $in: ["ACCEPTED", "PICKED_UP"] } }),
    collections.rescues.countDocuments({ recipientOrgId: organizationId, status: "DELIVERED" }),
  ]);
  return NextResponse.json({ incomingMatches, pendingDonations, acceptedDonations, completedRescues });
}
