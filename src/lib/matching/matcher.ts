import type { Donation } from "@/types/donation";
import type { Organization, RecipientPreference } from "@/types/organization";
import type { MatchResult } from "@/types/match";
import { checkFeasibility } from "./filters";
import { calculateScore } from "./scoring";

export function rankRecipients(
  donation: Donation,
  organizations: Organization[],
  preferences: RecipientPreference[],
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const organization of organizations) {
    const preference = preferences.find(
      (item) => item.organizationId === organization.id,
    );
    if (!preference) continue;

    const feasibility = checkFeasibility(donation, organization, preference);
    if (!feasibility.feasible) continue;

    const { finalScore, breakdown } = calculateScore(
      donation,
      preference,
      feasibility.distanceMiles,
    );

    const reasons = [
      `Accepts ${donation.foodCategory.replaceAll("_", " ")}`,
      `${donation.storageType} storage available`,
      `Capacity available for ${donation.quantityLbs} lbs`,
      `${feasibility.distanceMiles.toFixed(1)} miles away`,
      `Current need score ${preference.needsScore}/100`,
    ];

    results.push({
      id: `match-${donation.id}-${organization.id}`,
      donationId: donation.id,
      recipient: organization,
      distanceMiles: Number(feasibility.distanceMiles.toFixed(1)),
      finalScore,
      breakdown,
      reasons,
      explanation: `${organization.name} can handle the donation's food type and storage needs, has sufficient capacity, and is within the allowed pickup radius.`,
      status: "SUGGESTED",
    });
  }

  return results.sort((a, b) => b.finalScore - a.finalScore).slice(0, 3);
}
