# ReServe

ReServe connects surplus-food donors with nearby food organizations using current capacity, storage, receiving hours, and posted needs.

## Stack

- Next.js App Router with TypeScript
- MongoDB Atlas with GeoJSON and a `2dsphere` index
- Transformers.js using `Xenova/all-MiniLM-L6-v2`
- Leaflet with OpenStreetMap tiles
- JWT sessions in secure, HTTP-only cookies
- Recharts for role-scoped impact analytics

No paid AI, geocoding, or map API is required.

## Local setup

Requires Node.js 20 or newer and a MongoDB Atlas connection string.

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

Set a random `JWT_SECRET` of at least 32 characters. The first AI search downloads and caches the embedding model, so it can take longer than later searches.

## Environment

```dotenv
MONGODB_URI=mongodb+srv://...
MONGODB_DB=reserve
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
```

All values are server-only. Do not prefix them with `NEXT_PUBLIC_`.

## Create a food-vendor account from the terminal

```bash
npm run account:create-vendor
```

The command prompts for the vendor name, email, optional phone, and a masked password. It creates an active `restaurant` account and rejects duplicate normalized email addresses. Run `npm run account:create-vendor -- --help` for noninteractive options.

## Workflow

1. A restaurant account creates a donor-confirmed donation and pickup point.
2. MongoDB finds active organizations inside the selected radius.
3. Hard filters enforce category, storage, capacity, receiving hours, availability, deadline, and distance.
4. Transformers.js ranks eligible organizations by semantic similarity and deterministic matching signals.
5. The donor selects a saved match. Pickup and delivery update the rescue and impact metrics.

Food organizations maintain their profile, capacity, availability, and live needs at `/organization`. Analytics at `/dashboard` are scoped to the current user’s role.

## Verification

```bash
npm test
npm exec -- tsc --noEmit --incremental false
npm run build
npm audit --audit-level=high
```
