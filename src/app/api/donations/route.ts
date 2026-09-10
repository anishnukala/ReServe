import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

const donationSchema = z.object({
  foodName: z.string().min(2).max(120),
  foodCategory: z.string().min(2).max(60),
  quantityLbs: z.number().positive().max(100000),
  storageType: z.enum(["ambient", "refrigerated", "frozen"]),
  allergens: z.array(z.string()).default([]),
  dietaryTags: z.array(z.string()).default([]),
  preparedAt: z.string().nullable().optional(),
  pickupDeadline: z.string().datetime(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  donorSafetyConfirmed: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const body = donationSchema.parse(await request.json());
    const now = new Date().toISOString();

    if (new Date(body.pickupDeadline).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Pickup deadline must be in the future." }, { status: 400 });
    }

    const supabase = createServerClient();
    if (!supabase || process.env.DEMO_MODE === "true") {
      return NextResponse.json({
        donation: {
          id: `demo-${Date.now()}`,
          donorOrgId: null,
          ...body,
          status: "AVAILABLE",
          createdAt: now,
        },
        demo: true,
      });
    }

    const { data, error } = await supabase
      .from("donations")
      .insert({
        food_name: body.foodName,
        food_category: body.foodCategory,
        quantity_lbs: body.quantityLbs,
        storage_type: body.storageType,
        allergens: body.allergens,
        dietary_tags: body.dietaryTags,
        prepared_at: body.preparedAt ?? null,
        pickup_deadline: body.pickupDeadline,
        latitude: body.latitude,
        longitude: body.longitude,
        donor_safety_confirmed: body.donorSafetyConfirmed,
        status: "AVAILABLE",
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      donation: {
        id: data.id,
        donorOrgId: data.donor_org_id,
        foodName: data.food_name,
        foodCategory: data.food_category,
        quantityLbs: Number(data.quantity_lbs),
        storageType: data.storage_type,
        allergens: data.allergens ?? [],
        dietaryTags: data.dietary_tags ?? [],
        preparedAt: data.prepared_at,
        pickupDeadline: data.pickup_deadline,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        status: data.status,
        createdAt: data.created_at,
        donorSafetyConfirmed: Boolean(data.donor_safety_confirmed),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid donation." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to create donation." }, { status: 500 });
  }
}
