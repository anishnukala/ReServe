import { describe, expect, it } from "vitest";
import { rankRecipients } from "@/lib/matching/matcher";
import type { Donation } from "@/types/donation";
import type { Organization, RecipientPreference } from "@/types/organization";

const organizations: Organization[] = [
  { id: "recipient-a", name: "Recipient A", type: "FOOD_PANTRY", address: "Ames, IA", latitude: 42.0308, longitude: -93.6319 },
  { id: "recipient-b", name: "Recipient B", type: "NONPROFIT", address: "Ames, IA", latitude: 42.0224, longitude: -93.6171 },
];

const preferences: RecipientPreference[] = [
  { organizationId: "recipient-a", acceptedCategories: ["prepared_food"], storageCapabilities: ["refrigerated"], capacityLbs: 120, pickupRadiusMiles: 12, needsScore: 90, openHour: 8, closeHour: 20 },
  { organizationId: "recipient-b", acceptedCategories: ["prepared_food"], storageCapabilities: ["refrigerated"], capacityLbs: 80, pickupRadiusMiles: 12, needsScore: 75, openHour: 8, closeHour: 20 },
];

function futurePickupDeadline() {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 1);
  deadline.setHours(12, 0, 0, 0);
  return deadline.toISOString();
}

function donation(overrides: Partial<Donation> = {}): Donation {
  return {
    id: "test-donation",
    foodName: "Vegetarian pasta",
    foodCategory: "prepared_food",
    quantityLbs: 35,
    storageType: "refrigerated",
    allergens: ["wheat"],
    dietaryTags: ["vegetarian"],
    preparedAt: null,
    pickupDeadline: futurePickupDeadline(),
    latitude: 42.0266,
    longitude: -93.6465,
    status: "AVAILABLE",
    createdAt: new Date().toISOString(),
    donorSafetyConfirmed: true,
    ...overrides,
  };
}

describe("rankRecipients", () => {
  it("returns at most three ranked feasible recipients", () => {
    const results = rankRecipients(donation(), organizations, preferences);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].finalScore).toBeGreaterThanOrEqual(results[i].finalScore);
    }
  });

  it("filters recipients that cannot hold the donation", () => {
    const results = rankRecipients(donation({ quantityLbs: 500 }), organizations, preferences);
    expect(results).toHaveLength(0);
  });

  it("filters expired donations", () => {
    const results = rankRecipients(donation({ pickupDeadline: new Date(Date.now() - 60_000).toISOString() }), organizations, preferences);
    expect(results).toHaveLength(0);
  });
});
