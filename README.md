# ReServe

**Good food. Brighter tomorrows.**

ReServe is a surplus-food rescue prototype that connects food donors with compatible nearby community organizations before usable food becomes waste.

The matching engine first removes infeasible recipients, then ranks the remaining organizations using need, pickup feasibility, distance, capacity, and food preference. The score is explainable so donors can see why a recipient was recommended.

## Core workflow

```text
Create donation
   ↓
Validate donor input
   ↓
Filter incompatible recipients
   ↓
Rank top matches
   ↓
Select recipient
   ↓
Accept → Picked Up → Delivered
   ↓
Impact dashboard updates
```

## Included pages

- `/` — landing page
- `/donate` — donor form with optional AI-assisted description extraction
- `/matches/[donationId]` — top recipient matches and score breakdown
- `/rescue/[rescueId]` — rescue tracking workflow
- `/dashboard` — impact metrics
- `/organizations` — Google Places organization discovery
- `/recipient` — recipient-side prototype inbox
- `/food-safety` — product safety boundary
- `/privacy` — prototype privacy notice
- `/terms` — prototype terms

## Tech stack

- Next.js + TypeScript
- React
- Tailwind CSS + project-level CSS
- Supabase PostgreSQL
- Google Places API (New)
- OpenAI API (optional)
- Vitest

## Matching model

Hard filters remove recipients when a donation is operationally incompatible, including:

- unsupported food category
- missing storage capability
- insufficient capacity
- outside pickup radius
- pickup deadline already passed
- recipient closed during the pickup window

Feasible recipients are scored with:

```text
30% Need Match
25% Pickup Feasibility
20% Distance
15% Capacity Match
10% Food Preference Match
```

The prototype matching system is operational decision support. It does not certify food safety.

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env.local
```

The project starts in demo mode by default:

```env
DEMO_MODE=true
```

No Supabase, Google, or OpenAI keys are required in demo mode.

### 3. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Enable Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` for fictional demo organizations.
4. Set:

```env
DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The service-role key must remain server-side. Never expose it to browser code.

Before production, add Supabase authentication, Row Level Security, organization ownership, audit logging, and reviewed database policies.

## Enable Google Places

Enable **Places API (New)** in a Google Cloud project and configure a server-side API key:

```env
GOOGLE_MAPS_API_KEY=...
```

The `/organizations` page calls the official Places Text Search endpoint through a Next.js server route. ReServe-specific data such as accepted foods, capacity, storage capability, need, and verification status should remain in your own database.

Do not treat Google Places as a bulk business directory or scrape it into Supabase. Review Google's current Maps Platform terms before production use.

## Enable OpenAI extraction

AI is optional. It is only used to structure unstructured donor descriptions.

```env
OPENAI_API_KEY=...
OPENAI_MODEL=your-supported-model
```

AI must not infer or certify expiration, allergens, storage temperature, safety, or legal compliance. Those fields should be confirmed by the donor and recipient.

## Database tables

```text
organizations
recipient_preferences
donations
matches
rescues
```

See `docs/04-data-model.md` and `supabase/schema.sql`.

## Project structure

```text
reserve/
├── docs/
├── public/
│   └── logo/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── donate/
│   │   ├── food-safety/
│   │   ├── matches/
│   │   ├── organizations/
│   │   ├── privacy/
│   │   ├── recipient/
│   │   ├── rescue/
│   │   └── terms/
│   ├── components/
│   ├── data/
│   ├── lib/
│   └── types/
├── supabase/
├── tests/
├── .env.example
├── package.json
└── README.md
```

## Testing

```bash
npm test
```

Current matching tests cover:

- ranked feasible results
- oversized donations
- expired donations

Add tests for storage mismatches, unsupported categories, no-match cases, closed recipients, and API validation before production.

## Prototype data

Organizations and dashboard values included in demo mode are fictional or simulated. Do not present them as real operating data.

## Product boundary

ReServe coordinates donations and recommends operationally compatible recipients. Donors and recipients remain responsible for food handling, inspection, legal compliance, and acceptance decisions.

Before a public or commercial launch, have food-safety, privacy, platform terms, liability language, and local operating requirements reviewed for the jurisdictions you serve.
