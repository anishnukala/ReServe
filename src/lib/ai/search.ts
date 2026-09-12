import "server-only";

import type { Db } from "mongodb";
import { createEmbedding, cosineSimilarity, EMBEDDING_MODEL, embeddingHash, embeddingSource } from "./embeddings";
import { eligibilityReasons, type NearbyOrganization } from "./eligibility";
import { buildReasons } from "./explanations";
import { scoreMatch } from "./scoring";
import { getCollections } from "@/lib/mongodb/collections";
import { mapOrganizationDocument } from "@/lib/mongodb/mappers";
import type { Donation } from "@/types/donation";
import type { AiSearchMatch } from "@/types/match";

export async function searchAndRank(db: Db, donation: Donation, limit = 5): Promise<AiSearchMatch[]> {
  const collections = getCollections(db);
  const candidates = await collections.organizations.aggregate<NearbyOrganization>([
    { $geoNear: { near: donation.location, key: "location", distanceField: "distanceMeters", maxDistance: donation.searchRadiusMiles * 1609.344, spherical: true } },
    { $limit: 100 },
  ]).toArray();
  const eligible = candidates.filter((organization) => eligibilityReasons(donation, organization).length === 0);
  if (!eligible.length) return [];

  const needs = await collections.organizationNeeds.find({ organizationId: { $in: eligible.map((organization) => organization._id) }, active: true }).toArray();
  const donationEmbedding = await createEmbedding(`${donation.description}. ${donation.foodName}. ${donation.foodCategory}. ${donation.dietaryTags.join(", ")}. ${donation.storageType}`);
  const results: AiSearchMatch[] = [];

  for (const organization of eligible) {
    const organizationNeeds = needs.filter((need) => need.organizationId === organization._id);
    const source = embeddingSource(organization, organizationNeeds);
    const sourceHash = embeddingHash(source);
    let embedding = organization.embedding;
    if (!embedding || organization.embeddingModel !== EMBEDDING_MODEL || organization.embeddingSourceHash !== sourceHash) {
      embedding = await createEmbedding(source);
      await collections.organizations.updateOne({ _id: organization._id }, { $set: { embedding, embeddingModel: EMBEDDING_MODEL, embeddingSourceHash: sourceHash, embeddingUpdatedAt: new Date() } });
    }
    const aiSimilarity = Number(Math.max(0, cosineSimilarity(donationEmbedding, embedding)).toFixed(4));
    const distanceMiles = organization.distanceMeters / 1609.344;
    const scored = scoreMatch(donation, organization, organizationNeeds, aiSimilarity, distanceMiles);
    const recipient = mapOrganizationDocument(organization);
    const reasons = buildReasons(donation, organization, scored.urgency, aiSimilarity, distanceMiles);
    results.push({
      id: `match-${donation.id}-${organization._id}`, donationId: donation.id, organizationId: organization._id, name: organization.name, matchScore: scored.matchScore, finalScore: scored.matchScore, aiSimilarity,
      distanceMiles: Number(distanceMiles.toFixed(1)), matchedCategories: [donation.foodCategory, ...scored.dietaryMatches], availableCapacity: organization.availableCapacityLbs,
      urgency: scored.urgency, latitude: recipient.latitude, longitude: recipient.longitude, reasons, recipient,
      breakdown: { aiScore: scored.scores.ai, needScore: scored.scores.need, foodScore: scored.scores.food, pickupScore: scored.scores.pickup, distanceScore: scored.scores.distance, capacityScore: scored.scores.capacity, organizationScore: scored.scores.organization },
      explanation: reasons.join(". "), status: "SUGGESTED",
    });
  }
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}
