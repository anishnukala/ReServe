import { createMongoClient, requireMongoConfig } from "./shared.mjs";

const { uri, databaseName } = requireMongoConfig();
const client = createMongoClient(uri);

const validators = {
  users: { required: ["_id", "name", "email", "passwordHash", "role", "status", "createdAt", "updatedAt"] },
  organizations: { required: ["_id", "name", "description", "type", "address", "acceptedCategories", "dietaryPreferences", "storageCapabilities", "maximumCapacityLbs", "availableCapacityLbs", "pickupAvailable", "receivingHours", "rating", "verified", "status", "createdAt", "updatedAt"] },
  organization_needs: { required: ["_id", "organizationId", "foodCategory", "desiredQuantityLbs", "currentQuantityLbs", "urgencyScore", "storageType", "dietaryTags", "neededUntil", "active", "updatedAt"] },
  donations: { required: ["_id", "description", "foodName", "foodCategory", "quantityLbs", "storageType", "pickupDeadline", "location", "searchRadiusMiles", "status", "createdAt", "updatedAt", "donorSafetyConfirmed"] },
  matches: { required: ["_id", "donationId", "recipientOrgId", "distanceMiles", "finalScore", "aiSimilarity", "breakdown", "reasons", "explanation", "status", "createdAt"] },
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

  const now = new Date();
  for await (const organization of db.collection("organizations").find()) {
    const location = organization.location || (Number.isFinite(organization.longitude) && Number.isFinite(organization.latitude) ? { type: "Point", coordinates: [organization.longitude, organization.latitude] } : undefined);
    await db.collection("organizations").updateOne({ _id: organization._id }, { $set: {
      description: organization.description || "", acceptedCategories: organization.acceptedCategories || [], dietaryPreferences: organization.dietaryPreferences || [], storageCapabilities: organization.storageCapabilities || [],
      maximumCapacityLbs: Number(organization.maximumCapacityLbs || 0), availableCapacityLbs: Number(organization.availableCapacityLbs || 0), pickupAvailable: Boolean(organization.pickupAvailable),
      receivingHours: organization.receivingHours || { openHour: 8, closeHour: 17 }, rating: Number(organization.rating || 0), verified: Boolean(organization.verified ?? organization.reserveVerified),
      status: organization.status || (location ? "ACTIVE" : "INCOMPLETE"), updatedAt: organization.updatedAt || now, ...(location ? { location } : {}),
    } });
  }
  for await (const donation of db.collection("donations").find()) {
    const location = donation.location || { type: "Point", coordinates: [Number(donation.longitude), Number(donation.latitude)] };
    await db.collection("donations").updateOne({ _id: donation._id }, { $set: {
      description: donation.description || donation.foodName, location, searchRadiusMiles: Number(donation.searchRadiusMiles || 10), updatedAt: donation.updatedAt || donation.createdAt || now,
    } });
  }
  for await (const rescue of db.collection("rescues").find({ donorUserId: { $exists: false } })) {
    const donation = await db.collection("donations").findOne({ _id: rescue.donationId });
    if (donation?.donorUserId) await db.collection("rescues").updateOne({ _id: rescue._id }, { $set: { donorUserId: donation.donorUserId } });
  }

  for (const [name, schema] of Object.entries(validators)) {
    await ensureCollection(db, name, schema);
  }

  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("organizations").createIndex({ location: "2dsphere" }, { sparse: true }),
    db.collection("organizations").createIndex({ ownerUserId: 1 }, { unique: true, sparse: true }),
    db.collection("organization_needs").createIndex({ organizationId: 1, active: 1 }),
    db.collection("donations").createIndex({ status: 1 }),
    db.collection("donations").createIndex({ pickupDeadline: 1 }),
    db.collection("matches").createIndex({ donationId: 1, recipientOrgId: 1 }, { unique: true }),
    db.collection("rescues").createIndex({ donationId: 1 }, { unique: true }),
    db.collection("rescues").createIndex({ status: 1 }),
  ]);

  console.log(`MongoDB database "${databaseName}" is initialized with validators and indexes.`);
} finally {
  await client.close();
}
