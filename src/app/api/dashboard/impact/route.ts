import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerClient();
    if (!supabase || process.env.DEMO_MODE === "true") {
      return NextResponse.json({
        foodRescuedLbs: 327,
        estimatedMeals: 273,
        completedRescues: 14,
        averageMatchMinutes: 2.4,
        demo: true,
      });
    }

    const { data, error } = await supabase.from("rescues").select("quantity_rescued").eq("status", "DELIVERED");
    if (error) throw error;
    const foodRescuedLbs = Number((data ?? []).reduce((sum, row) => sum + Number(row.quantity_rescued || 0), 0).toFixed(1));
    return NextResponse.json({
      foodRescuedLbs,
      estimatedMeals: Math.round(foodRescuedLbs / 1.2),
      completedRescues: data?.length ?? 0,
      averageMatchMinutes: 0,
      demo: false,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to calculate impact." }, { status: 500 });
  }
}
