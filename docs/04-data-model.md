# Data Model

## organizations

Identity and location of an organization. A `google_place_id` may be stored when a location comes from Google Places.

## recipient_preferences

ReServe-owned operational data:

- accepted food categories
- storage capabilities
- capacity
- pickup radius
- need score
- operating window

## donations

- food name/category
- quantity
- storage type
- allergens
- dietary tags
- preparation/packaging time
- pickup deadline
- location
- donor safety confirmation
- status

## matches

Stores the score components and explanation for each ranked recipient.

## rescues

Tracks acceptance, pickup, delivery, and rescued quantity.

Documents use the application-facing camelCase field names defined in `src/lib/mongodb/collections.ts`. String IDs are stored in MongoDB's `_id` field so existing route URLs and migrated Supabase IDs remain stable.

Run `npm run db:setup` to create collection validators, query indexes, and uniqueness constraints. The command is idempotent and does not insert application data.
