import "server-only";

import { createHash } from "node:crypto";
import type { OrganizationDocument, OrganizationNeedDocument } from "@/lib/mongodb/collections";

export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

type Extractor = (text: string, options: { pooling: "mean"; normalize: true }) => Promise<{ tolist(): number[][] }>;
let extractorPromise: Promise<Extractor> | undefined;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import("@huggingface/transformers").then(async ({ pipeline }) =>
      pipeline("feature-extraction", EMBEDDING_MODEL) as unknown as Extractor,
    );
  }
  return extractorPromise;
}

export async function createEmbedding(text: string) {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return output.tolist()[0].map(Number);
}

export function embeddingSource(organization: OrganizationDocument, needs: OrganizationNeedDocument[]) {
  return [
    organization.description,
    `Accepts: ${organization.acceptedCategories.join(", ")}`,
    `Dietary preferences: ${organization.dietaryPreferences.join(", ")}`,
    `Storage: ${organization.storageCapabilities.join(", ")}`,
    ...needs.filter((need) => need.active).map((need) => `Needs ${need.foodCategory}, urgency ${need.urgencyScore}, tags ${need.dietaryTags.join(", ")}`),
  ].filter(Boolean).join(". ");
}

export function embeddingHash(source: string) {
  return createHash("sha256").update(source).digest("hex");
}

export function cosineSimilarity(a: number[], b: number[]) {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    aMagnitude += a[index] ** 2;
    bMagnitude += b[index] ** 2;
  }
  return aMagnitude && bMagnitude ? dot / Math.sqrt(aMagnitude * bMagnitude) : 0;
}
