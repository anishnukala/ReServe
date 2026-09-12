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
