import { NextResponse } from "next/server";
import type { Donation } from "@/types/donation";
import type { MatchResult } from "@/types/match";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { match?: MatchResult; donation?: Donation };
    if (!body.match || !body.donation) return NextResponse.json({ error: "Match and donation are required." }, { status: 400 });

    const acceptedAt = new Date().toISOString();
    const supabase = createServerClient();

    if (!supabase || process.env.DEMO_MODE === "true") {
      return NextResponse.json({
        rescue: {
          id: `rescue-${Date.now()}`,
          donationId: body.donation.id,
          recipientOrgId: body.match.recipient.id,
          status: "ACCEPTED",
          acceptedAt,
          pickedUpAt: null,
          deliveredAt: null,
          quantityRescued: body.donation.quantityLbs,
        },
        demo: true,
      });
    }

    const rescueId = `rescue-${crypto.randomUUID()}`;
    const [{ error: matchError }, { error: donationError }, { data: rescue, error: rescueError }] = await Promise.all([
      supabase.from("matches").update({ status: "ACCEPTED" }).eq("id", id),
      supabase.from("donations").update({ status: "ACCEPTED" }).eq("id", body.donation.id),
      supabase.from("rescues").insert({
        id: rescueId,
        donation_id: body.donation.id,
        recipient_org_id: body.match.recipient.id,
        accepted_at: acceptedAt,
        quantity_rescued: body.donation.quantityLbs,
        status: "ACCEPTED",
      }).select("*").single(),
    ]);
    if (matchError) throw matchError;
    if (donationError) throw donationError;
    if (rescueError) throw rescueError;

    return NextResponse.json({
      rescue: {
        id: rescue.id,
        donationId: rescue.donation_id,
        recipientOrgId: rescue.recipient_org_id,
        status: rescue.status,
        acceptedAt: rescue.accepted_at,
        pickedUpAt: rescue.picked_up_at,
        deliveredAt: rescue.delivered_at,
        quantityRescued: Number(rescue.quantity_rescued),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to accept match." }, { status: 500 });
  }
}
