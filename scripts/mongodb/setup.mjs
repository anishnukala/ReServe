import { createMongoClient, organizationSeeds, preferenceSeeds, requireMongoConfig, upsertDocuments } from "./shared.mjs";

const { uri, databaseName } = requireMongoConfig();
const client = createMongoClient(uri);

const validators = {
  organizations: { required: ["_id", "name", "type", "address", "latitude", "longitude", "reserveVerified", "createdAt"] },
  recipient_preferences: { required: ["_id", "organizationId", "acceptedCategories", "storageCapabilities", "capacityLbs", "pickupRadiusMiles", "needsScore", "openHour", "closeHour", "updatedAt"] },
  donations: { required: ["_id", "foodName", "foodCategory", "quantityLbs", "storageType", "pickupDeadline", "latitude", "longitude", "status", "createdAt", "donorSafetyConfirmed"] },
  matches: { required: ["_id", "donationId", "recipientOrgId", "distanceMiles", "finalScore", "breakdown", "reasons", "explanation", "status", "createdAt"] },
  rescues: { required: ["_id", "donationId", "recipientOrgId", "status", "acceptedAt", "quantityRescued"] },
};

async function ensureCollection(db, name, schema) {
  const exists = await db.listCollections({ name }, { nameOnly: true }).hasNext();
  const validator = { $jsonSchema: { bsonType: "object", ...schema } };
  if (!exists) {
    await db.createCollection(name, { validator });
  } else {
    await db.command({ collMod: name, validator });
  }
}

try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  const db = client.db(databaseName);

  for (const [name, schema] of Object.entries(validators)) {
    await ensureCollection(db, name, schema);
  }

  await Promise.all([
    db.collection("organizations").createIndex({ googlePlaceId: 1 }, { unique: true, sparse: true }),
    db.collection("recipient_preferences").createIndex({ organizationId: 1 }, { unique: true }),
    db.collection("donations").createIndex({ status: 1 }),
    db.collection("donations").createIndex({ pickupDeadline: 1 }),
    db.collection("matches").createIndex({ donationId: 1, recipientOrgId: 1 }, { unique: true }),
    db.collection("rescues").createIndex({ donationId: 1 }, { unique: true }),
    db.collection("rescues").createIndex({ status: 1 }),
  ]);

  const now = new Date();
  await upsertDocuments(db.collection("organizations"), organizationSeeds.map((document) => ({ ...document, createdAt: now })));
  await upsertDocuments(db.collection("recipient_preferences"), preferenceSeeds.map((document) => ({ ...document, updatedAt: now })));

  console.log(`MongoDB database "${databaseName}" is initialized with indexes and seed organizations.`);
} finally {
  await client.close();
}
