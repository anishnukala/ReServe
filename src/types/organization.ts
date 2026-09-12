export type StorageType = "ambient" | "refrigerated" | "frozen";
export type UserRole = "restaurant" | "food_org" | "admin";

export interface GeoPoint {
  type: "Point";
  coordinates: [longitude: number, latitude: number];
}

export type OrganizationType =
  | "RESTAURANT"
  | "FARM"
  | "GROCERY_STORE"
  | "DINING_CENTER"
  | "FOOD_PANTRY"
  | "SHELTER"
  | "NONPROFIT";

export interface Organization {
  id: string;
  ownerUserId?: string | null;
  name: string;
  description?: string;
  type: OrganizationType;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  acceptedCategories?: string[];
  dietaryPreferences?: string[];
  storageCapabilities?: StorageType[];
  maximumCapacityLbs?: number;
  availableCapacityLbs?: number;
  pickupAvailable?: boolean;
  receivingHours?: { openHour: number; closeHour: number };
  rating?: number;
  verified?: boolean;
  status?: "ACTIVE" | "PAUSED" | "DISABLED" | "INCOMPLETE";
}

export interface OrganizationNeed {
  id: string;
  organizationId: string;
  foodCategory: string;
  desiredQuantityLbs: number;
  currentQuantityLbs: number;
  urgencyScore: number;
  storageType: StorageType;
  dietaryTags: string[];
  neededUntil: string;
  active: boolean;
  updatedAt: string;
}
