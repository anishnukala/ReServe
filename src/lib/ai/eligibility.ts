import type { Donation } from "@/types/donation";
import type { OrganizationDocument } from "@/lib/mongodb/collections";

export interface NearbyOrganization extends OrganizationDocument { distanceMeters: number }

export function eligibilityReasons(donation: Donation, organization: NearbyOrganization) {
  const rejected: string[] = [];
  if (organization.status !== "ACTIVE" || !organization.pickupAvailable) rejected.push("Organization is unavailable");
  if (!organization.acceptedCategories.includes(donation.foodCategory)) rejected.push("Food category is not accepted");
  if (!organization.storageCapabilities.includes(donation.storageType)) rejected.push("Required storage is unavailable");
  if (organization.availableCapacityLbs < donation.quantityLbs) rejected.push("Available capacity is too low");
  if (organization.distanceMeters > donation.searchRadiusMiles * 1609.344) rejected.push("Organization is outside the search radius");
  const deadline = new Date(donation.pickupDeadline);
  const hour = deadline.getHours();
  if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) rejected.push("Pickup deadline has passed");
  else if (hour < organization.receivingHours.openHour || hour > organization.receivingHours.closeHour) rejected.push("Organization cannot receive before the pickup deadline");
  return rejected;
}
