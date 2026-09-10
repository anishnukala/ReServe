import type { StorageType } from "./organization";

export type DonationStatus =
  | "AVAILABLE"
  | "MATCHED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED";

export interface Donation {
  id: string;
  donorOrgId?: string | null;
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
  status: DonationStatus;
  createdAt: string;
  donorSafetyConfirmed: boolean;
}

export interface DonationInput {
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
  donorSafetyConfirmed: boolean;
}
