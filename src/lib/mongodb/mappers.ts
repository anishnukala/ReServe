import type { Donation } from "@/types/donation";
import type { Organization } from "@/types/organization";
import type { Rescue } from "@/types/rescue";
import type {
  DonationDocument,
  OrganizationDocument,
  RescueDocument,
} from "./collections";

export function mapDonationDocument(document: DonationDocument): Donation {
  return {
    id: document._id,
    donorUserId: document.donorUserId ?? null,
    donorOrganizationId: document.donorOrganizationId ?? null,
    donorOrgId: document.donorOrgId ?? null,
    description: document.description,
    foodName: document.foodName,
    foodCategory: document.foodCategory,
    quantityLbs: document.quantityLbs,
    storageType: document.storageType,
    allergens: document.allergens,
    dietaryTags: document.dietaryTags,
    preparedAt: document.preparedAt?.toISOString() ?? null,
    pickupDeadline: document.pickupDeadline.toISOString(),
    latitude: document.location.coordinates[1],
    longitude: document.location.coordinates[0],
    location: document.location,
    address: document.address ?? null,
    searchRadiusMiles: document.searchRadiusMiles,
    selectedOrganizationId: document.selectedOrganizationId ?? null,
    selectedMatchId: document.selectedMatchId ?? null,
    status: document.status,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    donorSafetyConfirmed: document.donorSafetyConfirmed,
  };
}

export function mapOrganizationDocument(document: OrganizationDocument): Organization {
  return {
    id: document._id,
    ownerUserId: document.ownerUserId ?? null,
    name: document.name,
    description: document.description,
    type: document.type,
    address: document.address,
    latitude: document.location?.coordinates[1] ?? 0,
    longitude: document.location?.coordinates[0] ?? 0,
    phone: document.phone ?? null,
    acceptedCategories: document.acceptedCategories,
    dietaryPreferences: document.dietaryPreferences,
    storageCapabilities: document.storageCapabilities,
    maximumCapacityLbs: document.maximumCapacityLbs,
    availableCapacityLbs: document.availableCapacityLbs,
    pickupAvailable: document.pickupAvailable,
    receivingHours: document.receivingHours,
    rating: document.rating,
    verified: document.verified,
    status: document.status,
  };
}

export function mapRescueDocument(document: RescueDocument): Rescue {
  return {
    id: document._id,
    donationId: document.donationId,
    recipientOrgId: document.recipientOrgId,
    donorUserId: document.donorUserId ?? null,
    status: document.status,
    acceptedAt: document.acceptedAt.toISOString(),
    pickedUpAt: document.pickedUpAt?.toISOString() ?? null,
    deliveredAt: document.deliveredAt?.toISOString() ?? null,
    quantityRescued: document.quantityRescued,
  };
}
