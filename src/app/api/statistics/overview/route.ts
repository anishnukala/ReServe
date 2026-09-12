import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections } from "@/lib/mongodb/collections";
import { POUNDS_PER_MEAL, rangeStart } from "@/lib/statistics/config";
import { donationScope, rescueScope } from "@/lib/statistics/scope";

export async function GET(request: Request) {
  try {
    const auth = await requireUser(); if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const db = await getMongoDatabase(); if (!db) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    const collections = getCollections(db); const start = rangeStart(new URL(request.url).searchParams.get("range"));
    const donationMatch = { ...donationScope(auth.user), ...(start ? { createdAt: { $gte: start } } : {}) }; const rescueMatch = { ...rescueScope(auth.user), ...(start ? { acceptedAt: { $gte: start } } : {}) };
    const joinedDonationMatch = Object.fromEntries(Object.entries(donationMatch).map(([key, value]) => [`donation.${key}`, value]));
    const [donationTotals, rescueTotals, scoreTotals, timingTotals, activeOrganizations, activeDonors] = await Promise.all([
      collections.donations.aggregate<{ total: number; active: number; successful: number; averageSize: number }>([{ $match: donationMatch }, { $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: [{ $in: ["$status", ["AVAILABLE", "MATCHED", "ACCEPTED", "PICKED_UP"]] }, 1, 0] } }, successful: { $sum: { $cond: [{ $in: ["$status", ["ACCEPTED", "PICKED_UP", "DELIVERED"]] }, 1, 0] } }, averageSize: { $avg: "$quantityLbs" } } }]).next(),
      collections.rescues.aggregate<{ foodRescuedLbs: number; completedRescues: number; averagePickupMinutes: number }>([{ $match: rescueMatch }, { $group: { _id: null, foodRescuedLbs: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, "$quantityRescued", 0] } }, completedRescues: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] } }, averagePickupMinutes: { $avg: { $cond: [{ $and: ["$pickedUpAt", "$acceptedAt"] }, { $divide: [{ $subtract: ["$pickedUpAt", "$acceptedAt"] }, 60000] }, null] } } } }]).next(),
      collections.matches.aggregate<{ averageMatchScore: number }>([{ $lookup: { from: "donations", localField: "donationId", foreignField: "_id", as: "donation" } }, { $unwind: "$donation" }, { $match: { ...joinedDonationMatch, ...(auth.user.role === "food_org" ? { recipientOrgId: auth.user.organizationId || "__none__" } : {}) } }, { $group: { _id: null, averageMatchScore: { $avg: "$finalScore" } } }]).next(),
      collections.matches.aggregate<{ averageMatchMinutes: number }>([{ $lookup: { from: "donations", localField: "donationId", foreignField: "_id", as: "donation" } }, { $unwind: "$donation" }, { $match: joinedDonationMatch }, { $group: { _id: null, averageMatchMinutes: { $avg: { $divide: [{ $subtract: ["$createdAt", "$donation.createdAt"] }, 60000] } } } }]).next(),
      auth.user.role === "admin" ? collections.organizations.aggregate<{ foodOrganizations: number }>([{ $match: { status: "ACTIVE" } }, { $count: "foodOrganizations" }]).next() : Promise.resolve(null),
      auth.user.role === "admin" ? collections.users.aggregate<{ donors: number }>([{ $match: { status: "ACTIVE", role: "restaurant" } }, { $count: "donors" }]).next() : Promise.resolve(null),
    ]);
    const pounds = Number((rescueTotals?.foodRescuedLbs || 0).toFixed(1)); const total = donationTotals?.total || 0;
    return NextResponse.json({ foodRescuedLbs: pounds, estimatedMeals: Math.round(pounds / POUNDS_PER_MEAL), completedRescues: rescueTotals?.completedRescues || 0, activeDonations: donationTotals?.active || 0, successfulMatchRate: total ? Number((((donationTotals?.successful || 0) / total) * 100).toFixed(1)) : 0, averageMatchScore: Number((scoreTotals?.averageMatchScore || 0).toFixed(1)), averageMatchMinutes: Number((timingTotals?.averageMatchMinutes || 0).toFixed(1)), averagePickupMinutes: Number((rescueTotals?.averagePickupMinutes || 0).toFixed(1)), averageDonationSize: Number((donationTotals?.averageSize || 0).toFixed(1)), activeFoodOrganizations: activeOrganizations?.foodOrganizations || 0, activeDonorOrganizations: activeDonors?.donors || 0 });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to calculate statistics." }, { status: 500 }); }
}
