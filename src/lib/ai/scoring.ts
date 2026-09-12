import type { Donation } from "@/types/donation";
import type { OrganizationDocument, OrganizationNeedDocument } from "@/lib/mongodb/collections";

export const MATCH_WEIGHTS = { ai: 0.2, need: 0.25, food: 0.15, pickup: 0.15, distance: 0.1, capacity: 0.1, organization: 0.05 } as const;
const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function scoreMatch(donation: Donation, organization: OrganizationDocument, needs: OrganizationNeedDocument[], aiSimilarity: number, distanceMiles: number) {
  const relevantNeeds = needs.filter((need) => need.active && need.foodCategory === donation.foodCategory && need.neededUntil.getTime() > Date.now());
  const urgency = relevantNeeds.length ? Math.max(...relevantNeeds.map((need) => need.urgencyScore)) : 0;
  const dietaryMatches = donation.dietaryTags.filter((tag) => organization.dietaryPreferences.includes(tag));
  const scores = {
    ai: clamp(aiSimilarity * 100),
    need: urgency,
    food: clamp(80 + Math.min(20, dietaryMatches.length * 10)),
    pickup: 100,
    distance: clamp(100 * (1 - distanceMiles / donation.searchRadiusMiles)),
    capacity: clamp(60 + (donation.quantityLbs / organization.availableCapacityLbs) * 40),
    organization: clamp((organization.verified ? 60 : 0) + (organization.rating / 5) * 40),
  };
  const total = Object.entries(MATCH_WEIGHTS).reduce((sum, [key, weight]) => sum + scores[key as keyof typeof scores] * weight, 0);
  return { matchScore: Number(total.toFixed(1)), urgency, dietaryMatches, scores };
}
