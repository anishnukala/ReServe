create extension if not exists pgcrypto;

create table if not exists organizations (
  id text primary key default gen_random_uuid()::text,
  google_place_id text unique,
  name text not null,
  type text not null check (type in ('RESTAURANT','FARM','GROCERY_STORE','DINING_CENTER','FOOD_PANTRY','SHELTER','NONPROFIT')),
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  phone text,
  reserve_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists recipient_preferences (
  organization_id text primary key references organizations(id) on delete cascade,
  accepted_categories text[] not null default '{}',
  storage_capabilities text[] not null default '{}',
  capacity_lbs numeric(10,2) not null default 0 check (capacity_lbs >= 0),
  pickup_radius_miles numeric(8,2) not null default 10 check (pickup_radius_miles >= 0),
  needs_score numeric(5,2) not null default 50 check (needs_score between 0 and 100),
  open_hour integer not null default 8 check (open_hour between 0 and 23),
  close_hour integer not null default 20 check (close_hour between 0 and 23),
  updated_at timestamptz not null default now()
);

create table if not exists donations (
  id text primary key default gen_random_uuid()::text,
  donor_org_id text references organizations(id) on delete set null,
  food_name text not null,
  food_category text not null,
  quantity_lbs numeric(10,2) not null check (quantity_lbs > 0),
  storage_type text not null check (storage_type in ('ambient','refrigerated','frozen')),
  allergens text[] not null default '{}',
  dietary_tags text[] not null default '{}',
  prepared_at timestamptz,
  pickup_deadline timestamptz not null,
  latitude double precision not null,
  longitude double precision not null,
  donor_safety_confirmed boolean not null default false,
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE','MATCHED','ACCEPTED','PICKED_UP','DELIVERED')),
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id text primary key,
  donation_id text not null references donations(id) on delete cascade,
  recipient_org_id text not null references organizations(id) on delete cascade,
  distance_score numeric(5,2) not null,
  need_score numeric(5,2) not null,
  capacity_score numeric(5,2) not null,
  pickup_score numeric(5,2) not null,
  food_score numeric(5,2) not null,
  final_score numeric(5,2) not null,
  explanation text not null,
  status text not null default 'SUGGESTED' check (status in ('SUGGESTED','ACCEPTED','DECLINED')),
  created_at timestamptz not null default now(),
  unique (donation_id, recipient_org_id)
);

create table if not exists rescues (
  id text primary key default gen_random_uuid()::text,
  donation_id text not null references donations(id) on delete cascade,
  recipient_org_id text not null references organizations(id) on delete cascade,
  status text not null default 'ACCEPTED' check (status in ('ACCEPTED','PICKED_UP','DELIVERED')),
  accepted_at timestamptz not null default now(),
  picked_up_at timestamptz,
  delivered_at timestamptz,
  quantity_rescued numeric(10,2) not null check (quantity_rescued > 0)
);

create index if not exists donations_status_idx on donations(status);
create index if not exists donations_deadline_idx on donations(pickup_deadline);
create index if not exists matches_donation_idx on matches(donation_id);
create index if not exists rescues_status_idx on rescues(status);

-- For a prototype, server routes use the service role key.
-- Before production, enable Row Level Security and add policies tied to authenticated users/organizations.
