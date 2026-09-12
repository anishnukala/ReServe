import { NextResponse } from "next/server";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";
import { POUNDS_PER_MEAL } from "@/lib/statistics/config";

export async function GET() {
  try {
    const db = await getMongoDatabase();
    if (!db) {
      return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    }

    const { rescues } = getCollections(db);
    const totals = await rescues.aggregate<{ foodRescuedLbs: number; completedRescues: number }>([
      { $match: { status: "DELIVERED" } },
      { $group: { _id: null, foodRescuedLbs: { $sum: "$quantityRescued" }, completedRescues: { $sum: 1 } } },
      { $project: { _id: 0, foodRescuedLbs: 1, completedRescues: 1 } },
    ]).next();
    const foodRescuedLbs = Number((totals?.foodRescuedLbs ?? 0).toFixed(1));
    return NextResponse.json({
      foodRescuedLbs,
      estimatedMeals: Math.round(foodRescuedLbs / POUNDS_PER_MEAL),
      activeDonations: 0,
      successfulMatchRate: 0,
      averageMatchScore: 0,
      averagePickupMinutes: 0,
      averageDonationSize: 0,
      activeFoodOrganizations: 0,
      activeDonorOrganizations: 0,
      completedRescues: totals?.completedRescues ?? 0,
      averageMatchMinutes: 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to calculate impact." }, { status: 500 });
  }
}
