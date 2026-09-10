import { NextResponse } from "next/server";
import type { Donation } from "@/types/donation";
import type { Organization, RecipientPreference } from "@/types/organization";
import { demoOrganizations, demoPreferences } from "@/data/demo-organizations";
import { rankRecipients } from "@/lib/matching/matcher";
import { createServerClient } from "@/lib/supabase/server";

function mapDonation(row: Record<string, any>): Donation {
  return {
    id: String(row.id),
    donorOrgId: row.donor_org_id ?? null,
    foodName: row.food_name,
    foodCategory: row.food_category,
    quantityLbs: Number(row.quantity_lbs),
    storageType: row.storage_type,
    allergens: row.allergens ?? [],
    dietaryTags: row.dietary_tags ?? [],
    preparedAt: row.prepared_at,
    pickupDeadline: row.pickup_deadline,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    status: row.status,
    createdAt: row.created_at,
    donorSafetyConfirmed: Boolean(row.donor_safety_confirmed),
  };
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    let donation = body.donation as Donation | null | undefined;
    const supabase = createServerClient();

    if ((!donation || donation.id !== id) && supabase && process.env.DEMO_MODE !== "true") {
      const { data, error } = await supabase.from("donations").select("*").eq("id", id).single();
      if (error || !data) return NextResponse.json({ error: "Donation not found." }, { status: 404 });
      donation = mapDonation(data);
    }

    if (!donation) return NextResponse.json({ error: "Donation data is required in demo mode." }, { status: 400 });

    let organizations: Organization[] = demoOrganizations;
    let preferences: RecipientPreference[] = demoPreferences;

    if (supabase && process.env.DEMO_MODE !== "true") {
      const [{ data: orgRows, error: orgError }, { data: prefRows, error: prefError }] = await Promise.all([
        supabase.from("organizations").select("*"),
        supabase.from("recipient_preferences").select("*"),
      ]);
      if (orgError) throw orgError;
      if (prefError) throw prefError;

      organizations = (orgRows ?? []).map((row) => ({
        id: String(row.id),
        googlePlaceId: row.google_place_id,
        name: row.name,
        type: row.type,
        address: row.address,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        phone: row.phone,
      }));
      preferences = (prefRows ?? []).map((row) => ({
        organizationId: String(row.organization_id),
        acceptedCategories: row.accepted_categories ?? [],
        storageCapabilities: row.storage_capabilities ?? [],
        capacityLbs: Number(row.capacity_lbs),
        pickupRadiusMiles: Number(row.pickup_radius_miles),
        needsScore: Number(row.needs_score),
        openHour: Number(row.open_hour),
        closeHour: Number(row.close_hour),
      }));
    }

    const matches = rankRecipients(donation, organizations, preferences);

    if (supabase && process.env.DEMO_MODE !== "true" && matches.length) {
      await supabase.from("matches").upsert(
        matches.map((match) => ({
          id: match.id,
          donation_id: donation!.id,
          recipient_org_id: match.recipient.id,
          distance_score: match.breakdown.distanceScore,
          need_score: match.breakdown.needScore,
          capacity_score: match.breakdown.capacityScore,
          pickup_score: match.breakdown.pickupScore,
          food_score: match.breakdown.foodScore,
          final_score: match.finalScore,
          explanation: match.explanation,
          status: "SUGGESTED",
        })),
        { onConflict: "id" },
      );
      await supabase.from("donations").update({ status: "MATCHED" }).eq("id", donation.id);
    }

    return NextResponse.json({ donation: { ...donation, status: matches.length ? "MATCHED" : donation.status }, matches });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to rank recipients." }, { status: 500 });
  }
}
