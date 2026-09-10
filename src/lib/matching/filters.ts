import type { Donation } from "@/types/donation";
import type { Organization, RecipientPreference } from "@/types/organization";
import { haversineMiles } from "./distance";

export interface FeasibilityResult {
  feasible: boolean;
  reasons: string[];
  distanceMiles: number;
}

export function checkFeasibility(
  donation: Donation,
  organization: Organization,
  preference: RecipientPreference,
): FeasibilityResult {
  const reasons: string[] = [];
  const distanceMiles = haversineMiles(
    donation.latitude,
    donation.longitude,
    organization.latitude,
    organization.longitude,
  );

  if (!preference.acceptedCategories.includes(donation.foodCategory)) {
    reasons.push("Food category is not accepted");
  }

  if (!preference.storageCapabilities.includes(donation.storageType)) {
    reasons.push("Required storage is unavailable");
  }

  if (preference.capacityLbs < donation.quantityLbs) {
    reasons.push("Recipient does not have enough capacity");
  }

  if (distanceMiles > preference.pickupRadiusMiles) {
    reasons.push("Recipient is outside the pickup radius");
  }

  const deadline = new Date(donation.pickupDeadline);
  if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) {
    reasons.push("Donation deadline has passed");
  } else {
    const hour = deadline.getHours();
    if (hour < preference.openHour || hour > preference.closeHour) {
      reasons.push("Recipient is closed during the pickup window");
    }
  }

  return {
    feasible: reasons.length === 0,
    reasons,
    distanceMiles,
  };
}
