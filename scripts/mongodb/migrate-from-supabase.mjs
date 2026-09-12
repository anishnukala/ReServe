import { createMongoClient, requireMongoConfig, upsertDocuments } from "./shared.mjs";

const { uri, databaseName } = requireMongoConfig();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  throw new Error("A Supabase source requires NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.");
}

async function readTable(table) {
  const rows = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const url = new URL(`/rest/v1/${table}`, supabaseUrl);
    url.searchParams.set("select", "*");
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("offset", String(offset));
    const response = await fetch(url, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!response.ok) throw new Error(`Unable to read ${table}: ${response.status} ${await response.text()}`);
    const page = await response.json();
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

const date = (value) => value ? new Date(value) : null;
const mappers = {
  organizations: (row) => ({ _id: String(row.id), googlePlaceId: row.google_place_id, name: row.name, type: row.type, address: row.address, latitude: Number(row.latitude), longitude: Number(row.longitude), phone: row.phone, reserveVerified: Boolean(row.reserve_verified), createdAt: date(row.created_at) || new Date() }),
  recipient_preferences: (row) => ({ _id: String(row.organization_id), organizationId: String(row.organization_id), acceptedCategories: row.accepted_categories || [], storageCapabilities: row.storage_capabilities || [], capacityLbs: Number(row.capacity_lbs), pickupRadiusMiles: Number(row.pickup_radius_miles), needsScore: Number(row.needs_score), openHour: Number(row.open_hour), closeHour: Number(row.close_hour), updatedAt: date(row.updated_at) || new Date() }),
  donations: (row) => ({ _id: String(row.id), donorOrgId: row.donor_org_id, foodName: row.food_name, foodCategory: row.food_category, quantityLbs: Number(row.quantity_lbs), storageType: row.storage_type, allergens: row.allergens || [], dietaryTags: row.dietary_tags || [], preparedAt: date(row.prepared_at), pickupDeadline: date(row.pickup_deadline), latitude: Number(row.latitude), longitude: Number(row.longitude), donorSafetyConfirmed: Boolean(row.donor_safety_confirmed), status: row.status, createdAt: date(row.created_at) || new Date() }),
  matches: (row) => ({ _id: String(row.id), donationId: String(row.donation_id), recipientOrgId: String(row.recipient_org_id), distanceMiles: Number(row.distance_miles || 0), finalScore: Number(row.final_score), breakdown: { distanceScore: Number(row.distance_score), needScore: Number(row.need_score), capacityScore: Number(row.capacity_score), pickupScore: Number(row.pickup_score), foodScore: Number(row.food_score) }, reasons: row.reasons || [], explanation: row.explanation, status: row.status, createdAt: date(row.created_at) || new Date() }),
  rescues: (row) => ({ _id: String(row.id), donationId: String(row.donation_id), recipientOrgId: String(row.recipient_org_id), status: row.status, acceptedAt: date(row.accepted_at) || new Date(), pickedUpAt: date(row.picked_up_at), deliveredAt: date(row.delivered_at), quantityRescued: Number(row.quantity_rescued) }),
};

const client = createMongoClient(uri);
try {
  await client.connect();
  const db = client.db(databaseName);
  for (const [table, mapRow] of Object.entries(mappers)) {
    const rows = await readTable(table);
    await upsertDocuments(db.collection(table), rows.map(mapRow));
    console.log(`${table}: migrated ${rows.length} row(s)`);
  }
  console.log(`Supabase data migration to MongoDB database "${databaseName}" completed.`);
} finally {
  await client.close();
}
