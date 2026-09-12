import "server-only";

import { MongoClient, ServerApiVersion, type Db } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  reserveMongoClientPromise?: Promise<MongoClient>;
};

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

async function connectClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  const client = new MongoClient(uri, {
    appName: "reserve-nextjs",
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  return client.connect();
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) return null;

  if (!globalForMongo.reserveMongoClientPromise) {
    globalForMongo.reserveMongoClientPromise = connectClient().catch((error) => {
      globalForMongo.reserveMongoClientPromise = undefined;
      throw error;
    });
  }

  return globalForMongo.reserveMongoClientPromise;
}

export async function getMongoDatabase(): Promise<Db | null> {
  const client = await getMongoClient();
  return client?.db(process.env.MONGODB_DB || "reserve") ?? null;
}
