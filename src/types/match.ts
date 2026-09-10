import type { Organization } from "./organization";

export interface MatchBreakdown {
  needScore: number;
  pickupScore: number;
  distanceScore: number;
  capacityScore: number;
  foodScore: number;
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
  status: "SUGGESTED" | "ACCEPTED" | "DECLINED";
}
