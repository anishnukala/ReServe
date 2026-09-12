import { NextResponse } from "next/server";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";

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
      estimatedMeals: Math.round(foodRescuedLbs / 1.2),
      completedRescues: totals?.completedRescues ?? 0,
      averageMatchMinutes: 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to calculate impact." }, { status: 500 });
  }
}
