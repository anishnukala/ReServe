import { describe, expect, it } from "vitest";
import { rankRecipients } from "@/lib/matching/matcher";
import { demoOrganizations, demoPreferences } from "@/data/demo-organizations";
import type { Donation } from "@/types/donation";

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
    const results = rankRecipients(donation(), demoOrganizations, demoPreferences);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].finalScore).toBeGreaterThanOrEqual(results[i].finalScore);
    }
  });

  it("filters recipients that cannot hold the donation", () => {
    const results = rankRecipients(donation({ quantityLbs: 500 }), demoOrganizations, demoPreferences);
    expect(results).toHaveLength(0);
  });

  it("filters expired donations", () => {
    const results = rankRecipients(donation({ pickupDeadline: new Date(Date.now() - 60_000).toISOString() }), demoOrganizations, demoPreferences);
    expect(results).toHaveLength(0);
  });
});
