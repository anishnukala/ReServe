export type StorageType = "ambient" | "refrigerated" | "frozen";

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
  googlePlaceId?: string | null;
  name: string;
  type: OrganizationType;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
}

export interface RecipientPreference {
  organizationId: string;
  acceptedCategories: string[];
  storageCapabilities: StorageType[];
  capacityLbs: number;
  pickupRadiusMiles: number;
  needsScore: number;
  openHour: number;
  closeHour: number;
}
