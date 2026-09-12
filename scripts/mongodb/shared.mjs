import { MongoClient, ServerApiVersion } from "mongodb";

export function requireMongoConfig() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required.");
  return { uri, databaseName: process.env.MONGODB_DB || "reserve" };
}

export function createMongoClient(uri) {
  return new MongoClient(uri, {
    appName: "reserve-migration",
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

export async function upsertDocuments(collection, documents) {
  if (!documents.length) return 0;
  const result = await collection.bulkWrite(
    documents.map((document) => ({
      replaceOne: {
        filter: { _id: document._id },
        replacement: document,
        upsert: true,
      },
    })),
  );
  return result.upsertedCount + result.modifiedCount + result.matchedCount;
}

export const organizationSeeds = [
  { _id: "org-1", name: "Demo Ames Community Pantry", type: "FOOD_PANTRY", address: "Ames, IA", latitude: 42.0308, longitude: -93.6319, reserveVerified: false },
  { _id: "org-2", name: "Demo Central Iowa Shelter", type: "SHELTER", address: "Ames, IA", latitude: 42.0224, longitude: -93.6171, reserveVerified: false },
  { _id: "org-3", name: "Demo Campus Community Kitchen", type: "NONPROFIT", address: "Ames, IA", latitude: 42.0266, longitude: -93.6465, reserveVerified: false },
  { _id: "org-4", name: "Demo Story County Food Support", type: "FOOD_PANTRY", address: "Ames, IA", latitude: 42.0461, longitude: -93.6128, reserveVerified: false },
  { _id: "org-5", name: "Demo North Ames Resource Center", type: "NONPROFIT", address: "Ames, IA", latitude: 42.0572, longitude: -93.6402, reserveVerified: false },
];

export const preferenceSeeds = [
  { _id: "org-1", organizationId: "org-1", acceptedCategories: ["prepared_food", "produce", "bakery", "packaged_food"], storageCapabilities: ["ambient", "refrigerated", "frozen"], capacityLbs: 120, pickupRadiusMiles: 12, needsScore: 96, openHour: 8, closeHour: 20 },
  { _id: "org-2", organizationId: "org-2", acceptedCategories: ["prepared_food", "packaged_food", "bakery"], storageCapabilities: ["ambient", "refrigerated"], capacityLbs: 75, pickupRadiusMiles: 9, needsScore: 88, openHour: 7, closeHour: 22 },
  { _id: "org-3", organizationId: "org-3", acceptedCategories: ["prepared_food", "produce", "bakery"], storageCapabilities: ["ambient", "refrigerated"], capacityLbs: 55, pickupRadiusMiles: 7, needsScore: 84, openHour: 9, closeHour: 19 },
  { _id: "org-4", organizationId: "org-4", acceptedCategories: ["produce", "packaged_food", "bakery"], storageCapabilities: ["ambient", "refrigerated", "frozen"], capacityLbs: 200, pickupRadiusMiles: 15, needsScore: 78, openHour: 8, closeHour: 18 },
  { _id: "org-5", organizationId: "org-5", acceptedCategories: ["prepared_food", "produce", "packaged_food"], storageCapabilities: ["ambient", "refrigerated"], capacityLbs: 90, pickupRadiusMiles: 10, needsScore: 91, openHour: 10, closeHour: 21 },
];
