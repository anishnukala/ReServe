import type { Donation } from "@/types/donation";
import type { RecipientPreference } from "@/types/organization";
import type { MatchBreakdown } from "@/types/match";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function calculateScore(
  donation: Donation,
  preference: RecipientPreference,
  distanceMiles: number,
): { finalScore: number; breakdown: MatchBreakdown } {
  const needScore = clamp(preference.needsScore);

  const timeRemainingHours = Math.max(
    0,
    (new Date(donation.pickupDeadline).getTime() - Date.now()) / 3_600_000,
  );
  const pickupScore = clamp((timeRemainingHours / 4) * 100);

  const distanceScore = clamp(
    100 - (distanceMiles / Math.max(preference.pickupRadiusMiles, 1)) * 70,
  );

  const capacityUtilization = donation.quantityLbs / Math.max(preference.capacityLbs, 1);
  const capacityScore = clamp(100 - Math.abs(0.6 - capacityUtilization) * 80);

  const foodScore = preference.acceptedCategories.includes(donation.foodCategory)
    ? 100
    : 0;

  const finalScore =
    needScore * 0.3 +
    pickupScore * 0.25 +
    distanceScore * 0.2 +
    capacityScore * 0.15 +
    foodScore * 0.1;

  return {
    finalScore: Number(finalScore.toFixed(1)),
    breakdown: {
      needScore: Number(needScore.toFixed(1)),
      pickupScore: Number(pickupScore.toFixed(1)),
      distanceScore: Number(distanceScore.toFixed(1)),
      capacityScore: Number(capacityScore.toFixed(1)),
      foodScore: Number(foodScore.toFixed(1)),
    },
  };
}
