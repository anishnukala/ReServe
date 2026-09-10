import { NextResponse } from "next/server";
import type { Donation } from "@/types/donation";
import type { Rescue } from "@/types/rescue";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { rescue?: Rescue; donation?: Donation | null };
    const pickedUpAt = new Date().toISOString();
    const supabase = createServerClient();

    if (!supabase || process.env.DEMO_MODE === "true") {
      if (!body.rescue) return NextResponse.json({ error: "Rescue data is required in demo mode." }, { status: 400 });
      return NextResponse.json({ rescue: { ...body.rescue, id, status: "PICKED_UP", pickedUpAt } });
    }

    const { data, error } = await supabase.from("rescues").update({ status: "PICKED_UP", picked_up_at: pickedUpAt }).eq("id", id).select("*").single();
    if (error) throw error;
    await supabase.from("donations").update({ status: "PICKED_UP" }).eq("id", data.donation_id);

    return NextResponse.json({ rescue: {
      id: data.id, donationId: data.donation_id, recipientOrgId: data.recipient_org_id,
      status: data.status, acceptedAt: data.accepted_at, pickedUpAt: data.picked_up_at,
      deliveredAt: data.delivered_at, quantityRescued: Number(data.quantity_rescued),
    }});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to mark pickup." }, { status: 500 });
  }
}
