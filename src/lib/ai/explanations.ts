import type { Donation } from "@/types/donation";
import type { OrganizationDocument } from "@/lib/mongodb/collections";

export function buildReasons(donation: Donation, organization: OrganizationDocument, urgency: number, aiSimilarity: number, distanceMiles: number) {
  const reasons = [
    `Accepts ${donation.storageType} ${donation.foodCategory.replaceAll("_", " ")}`,
    `${donation.quantityLbs} lbs fits within ${organization.availableCapacityLbs} lbs available capacity`,
    `Can receive before the ${new Date(donation.pickupDeadline).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} deadline`,
    `${distanceMiles.toFixed(1)} miles from pickup location`,
  ];
  if (urgency > 0) reasons.unshift(`Current need urgency is ${urgency}/100 for ${donation.foodCategory.replaceAll("_", " ")}`);
  if (aiSimilarity >= 0.65) reasons.push("Donation description closely matches current organization needs");
  if (organization.verified) reasons.push("Verified ReServe organization");
  return reasons;
}
