import type { Db } from "mongodb";
import type { DonationStatus } from "@/types/donation";
import type { MatchBreakdown } from "@/types/match";
import type { GeoPoint, OrganizationType, StorageType, UserRole } from "@/types/organization";
import type { Rescue } from "@/types/rescue";

export interface OrganizationDocument {
  _id: string;
  ownerUserId?: string | null;
  name: string;
  description: string;
  type: OrganizationType;
  address: string;
  location?: GeoPoint;
  phone?: string | null;
  acceptedCategories: string[];
  dietaryPreferences: string[];
  storageCapabilities: StorageType[];
  maximumCapacityLbs: number;
  availableCapacityLbs: number;
  pickupAvailable: boolean;
  receivingHours: { openHour: number; closeHour: number };
  rating: number;
  verified: boolean;
  status: "ACTIVE" | "PAUSED" | "DISABLED" | "INCOMPLETE";
  embedding?: number[];
  embeddingModel?: string;
  embeddingSourceHash?: string;
  embeddingUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationNeedDocument {
  _id: string;
  organizationId: string;
  foodCategory: string;
  desiredQuantityLbs: number;
  currentQuantityLbs: number;
  urgencyScore: number;
  storageType: StorageType;
  dietaryTags: string[];
  neededUntil: Date;
  active: boolean;
  updatedAt: Date;
}

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  role: UserRole;
  status: "ACTIVE" | "DISABLED" | "SUSPENDED";
  organizationId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DonationDocument {
  _id: string;
  donorUserId?: string | null;
  donorOrganizationId?: string | null;
  donorOrgId?: string | null;
  description: string;
  foodName: string;
  foodCategory: string;
  quantityLbs: number;
  storageType: StorageType;
  allergens: string[];
  dietaryTags: string[];
  preparedAt?: Date | null;
  pickupDeadline: Date;
  location: GeoPoint;
  address?: string | null;
  searchRadiusMiles: number;
  selectedOrganizationId?: string | null;
  selectedMatchId?: string | null;
  status: DonationStatus;
  createdAt: Date;
  updatedAt: Date;
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
  status: "SUGGESTED" | "SELECTED" | "ACCEPTED" | "DECLINED";
  aiSimilarity: number;
  createdAt: Date;
}

export interface RescueDocument {
  _id: string;
  donationId: string;
  recipientOrgId: string;
  donorUserId?: string | null;
  status: Rescue["status"];
  acceptedAt: Date;
  pickedUpAt?: Date | null;
  deliveredAt?: Date | null;
  quantityRescued: number;
}

export function getCollections(db: Db) {
  return {
    organizations: db.collection<OrganizationDocument>("organizations"),
    organizationNeeds: db.collection<OrganizationNeedDocument>("organization_needs"),
    users: db.collection<UserDocument>("users"),
    donations: db.collection<DonationDocument>("donations"),
    matches: db.collection<MatchDocument>("matches"),
    rescues: db.collection<RescueDocument>("rescues"),
  };
}
