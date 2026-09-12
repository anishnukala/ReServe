import { describe, expect, it } from "vitest";
import { eligibilityReasons, type NearbyOrganization } from "@/lib/ai/eligibility";
import { MATCH_WEIGHTS, scoreMatch } from "@/lib/ai/scoring";
import type { Donation } from "@/types/donation";

const now = new Date();
const donation: Donation = { id: "donation-1", description: "Vegetarian refrigerated pasta", foodName: "Pasta", foodCategory: "prepared_food", quantityLbs: 35, storageType: "refrigerated", allergens: ["wheat"], dietaryTags: ["vegetarian"], pickupDeadline: new Date(now.getTime() + 3_600_000).toISOString(), latitude: 42, longitude: -93, location: { type: "Point", coordinates: [-93, 42] }, searchRadiusMiles: 10, status: "AVAILABLE", createdAt: now.toISOString(), updatedAt: now.toISOString(), donorSafetyConfirmed: true };
const organization: NearbyOrganization = { _id: "org-1", name: "Community Pantry", description: "Local pantry", type: "FOOD_PANTRY", address: "Main Street", location: { type: "Point", coordinates: [-93, 42] }, acceptedCategories: ["prepared_food"], dietaryPreferences: ["vegetarian"], storageCapabilities: ["refrigerated"], maximumCapacityLbs: 100, availableCapacityLbs: 60, pickupAvailable: true, receivingHours: { openHour: 0, closeHour: 23 }, rating: 4.5, verified: true, status: "ACTIVE", createdAt: now, updatedAt: now, distanceMeters: 1609.344 };

describe("AI matching rules", () => {
  it("applies eligibility before ranking", () => { expect(eligibilityReasons(donation, organization)).toEqual([]); expect(eligibilityReasons({ ...donation, quantityLbs: 70 }, organization)).toContain("Available capacity is too low"); expect(eligibilityReasons({ ...donation, storageType: "frozen" }, organization)).toContain("Required storage is unavailable"); });
  it("keeps configured weights normalized", () => { expect(Object.values(MATCH_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1); });
  it("uses current need and semantic similarity in the score", () => { const need = { _id: "need-1", organizationId: "org-1", foodCategory: "prepared_food", desiredQuantityLbs: 100, currentQuantityLbs: 10, urgencyScore: 90, storageType: "refrigerated" as const, dietaryTags: ["vegetarian"], neededUntil: new Date(now.getTime() + 86_400_000), active: true, updatedAt: now }; const high = scoreMatch(donation, organization, [need], .9, 1); const low = scoreMatch(donation, organization, [], .1, 8); expect(high.matchScore).toBeGreaterThan(low.matchScore); expect(high.urgency).toBe(90); });
});
