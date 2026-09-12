import type { Donation } from "@/types/donation";
import type { Organization, RecipientPreference } from "@/types/organization";
import type { Rescue } from "@/types/rescue";
import type {
  DonationDocument,
  OrganizationDocument,
  RecipientPreferenceDocument,
  RescueDocument,
} from "./collections";

export function mapDonationDocument(document: DonationDocument): Donation {
  return {
    id: document._id,
    donorOrgId: document.donorOrgId ?? null,
    foodName: document.foodName,
    foodCategory: document.foodCategory,
    quantityLbs: document.quantityLbs,
    storageType: document.storageType,
    allergens: document.allergens,
    dietaryTags: document.dietaryTags,
    preparedAt: document.preparedAt?.toISOString() ?? null,
    pickupDeadline: document.pickupDeadline.toISOString(),
    latitude: document.latitude,
    longitude: document.longitude,
    status: document.status,
    createdAt: document.createdAt.toISOString(),
    donorSafetyConfirmed: document.donorSafetyConfirmed,
  };
}

export function mapOrganizationDocument(document: OrganizationDocument): Organization {
  return {
    id: document._id,
    googlePlaceId: document.googlePlaceId ?? null,
    name: document.name,
    type: document.type,
    address: document.address,
    latitude: document.latitude,
    longitude: document.longitude,
    phone: document.phone ?? null,
  };
}

export function mapPreferenceDocument(document: RecipientPreferenceDocument): RecipientPreference {
  return {
    organizationId: document.organizationId,
    acceptedCategories: document.acceptedCategories,
    storageCapabilities: document.storageCapabilities,
    capacityLbs: document.capacityLbs,
    pickupRadiusMiles: document.pickupRadiusMiles,
    needsScore: document.needsScore,
    openHour: document.openHour,
    closeHour: document.closeHour,
  };
}

export function mapRescueDocument(document: RescueDocument): Rescue {
  return {
    id: document._id,
    donationId: document.donationId,
    recipientOrgId: document.recipientOrgId,
    status: document.status,
    acceptedAt: document.acceptedAt.toISOString(),
    pickedUpAt: document.pickedUpAt?.toISOString() ?? null,
    deliveredAt: document.deliveredAt?.toISOString() ?? null,
    quantityRescued: document.quantityRescued,
  };
}
