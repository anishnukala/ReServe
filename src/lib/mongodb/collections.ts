import type { Db } from "mongodb";
import type { DonationStatus } from "@/types/donation";
import type { MatchBreakdown } from "@/types/match";
import type { OrganizationType, StorageType } from "@/types/organization";
import type { Rescue } from "@/types/rescue";

export interface OrganizationDocument {
  _id: string;
  googlePlaceId?: string | null;
  name: string;
  type: OrganizationType;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  reserveVerified: boolean;
  createdAt: Date;
}

export interface RecipientPreferenceDocument {
  _id: string;
  organizationId: string;
  acceptedCategories: string[];
  storageCapabilities: StorageType[];
  capacityLbs: number;
  pickupRadiusMiles: number;
  needsScore: number;
  openHour: number;
  closeHour: number;
  updatedAt: Date;
}

export interface DonationDocument {
  _id: string;
  donorOrgId?: string | null;
  foodName: string;
  foodCategory: string;
  quantityLbs: number;
  storageType: StorageType;
  allergens: string[];
  dietaryTags: string[];
  preparedAt?: Date | null;
  pickupDeadline: Date;
  latitude: number;
  longitude: number;
  status: DonationStatus;
  createdAt: Date;
  donorSafetyConfirmed: boolean;
}

export interface MatchDocument {
  _id: string;
  donationId: string;
  recipientOrgId: string;
  distanceMiles: number;
  finalScore: number;
  breakdown: MatchBreakdown;
  reasons: string[];
  explanation: string;
  status: "SUGGESTED" | "ACCEPTED" | "DECLINED";
  createdAt: Date;
}

export interface RescueDocument {
  _id: string;
  donationId: string;
  recipientOrgId: string;
  status: Rescue["status"];
  acceptedAt: Date;
  pickedUpAt?: Date | null;
  deliveredAt?: Date | null;
  quantityRescued: number;
}

export function getCollections(db: Db) {
  return {
    organizations: db.collection<OrganizationDocument>("organizations"),
    recipientPreferences: db.collection<RecipientPreferenceDocument>("recipient_preferences"),
    donations: db.collection<DonationDocument>("donations"),
    matches: db.collection<MatchDocument>("matches"),
    rescues: db.collection<RescueDocument>("rescues"),
  };
}
