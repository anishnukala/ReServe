import type { Organization } from "./organization";

export interface MatchBreakdown {
  aiScore?: number;
  needScore: number;
  pickupScore: number;
  distanceScore: number;
  capacityScore: number;
  foodScore: number;
  organizationScore?: number;
}

export interface MatchResult {
  id: string;
  donationId: string;
  recipient: Organization;
  distanceMiles: number;
  finalScore: number;
  breakdown: MatchBreakdown;
  reasons: string[];
  explanation: string;
  status: "SUGGESTED" | "SELECTED" | "ACCEPTED" | "DECLINED";
  matchScore?: number;
  aiSimilarity?: number;
  matchedCategories?: string[];
  availableCapacity?: number;
  urgency?: number;
}

export interface AiSearchMatch extends MatchResult {
  organizationId: string;
  name: string;
  matchScore: number;
  aiSimilarity: number;
  matchedCategories: string[];
  availableCapacity: number;
  urgency: number;
  latitude: number;
  longitude: number;
}
