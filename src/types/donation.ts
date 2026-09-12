import type { GeoPoint, StorageType } from "./organization";

export type DonationStatus =
  | "AVAILABLE"
  | "MATCHED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED";

export interface Donation {
  id: string;
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
  preparedAt?: string | null;
  pickupDeadline: string;
  latitude: number;
  longitude: number;
  location: GeoPoint;
  address?: string | null;
  searchRadiusMiles: number;
  selectedOrganizationId?: string | null;
  selectedMatchId?: string | null;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  donorSafetyConfirmed: boolean;
}

export interface DonationInput {
  description: string;
  foodName: string;
  foodCategory: string;
  quantityLbs: number;
  storageType: StorageType;
  allergens: string[];
  dietaryTags: string[];
  preparedAt?: string | null;
  pickupDeadline: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  searchRadiusMiles: number;
  donorSafetyConfirmed: boolean;
}
