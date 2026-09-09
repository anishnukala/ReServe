# ♻️ ReServe

**Smart food rescue, before good food becomes waste.**

ReServe is a surplus food rescue platform that connects restaurants, farms, grocery stores, dining centers, and other food donors with nearby food pantries, shelters, and community organizations.

Instead of simply finding the closest organization, ReServe evaluates factors such as food type, storage capability, recipient capacity, pickup feasibility, distance, and current need to recommend the best destination for each donation.

---

## 📌 Overview

Food businesses and organizations often have perfectly usable surplus food that must be distributed quickly before it expires.

At the same time, food pantries, shelters, and nonprofit organizations may need those supplies but lack a fast and efficient way to discover and coordinate available donations.

ReServe helps solve this problem through an intelligent food-matching and rescue workflow.

### ReServe Workflow

```text
Donor Creates Donation
        ↓
Donation Information Validated
        ↓
Compatible Organizations Filtered
        ↓
Matching Engine Calculates Scores
        ↓
Top Recipients Ranked
        ↓
Recipient Accepts Donation
        ↓
Food Picked Up
        ↓
Food Delivered
        ↓
Impact Dashboard Updated
```

---

## ✨ Key Features

* 🍽️ Surplus food donation creation
* 📍 Nearby recipient discovery
* 🧠 Intelligent recipient matching
* 📊 Explainable match scoring
* ❄️ Storage capability matching
* 📦 Capacity-based filtering
* ⏰ Pickup deadline awareness
* 🚚 Rescue status tracking
* 📈 Food rescue impact dashboard
* 🤖 AI-assisted food description extraction
* 🛡️ Food safety and donation traceability

---

## 🧠 Matching Engine

ReServe first removes organizations that cannot safely or realistically receive a donation.

### Hard Filters

Organizations may be excluded when:

```text
Food category is not accepted

Required storage is unavailable

Recipient does not have enough capacity

Recipient is outside the pickup radius

Recipient is closed during the pickup window

Pickup cannot be completed before the donation deadline
```

After filtering, compatible organizations are ranked using a weighted score.

```text
Match Score =

30% Need Match
+ 25% Pickup Feasibility
+ 20% Distance
+ 15% Capacity Match
+ 10% Food Preference Match
```

Example result:

```text
Food at First

Match Score: 94%

✓ Accepts prepared food
✓ Refrigerated storage available
✓ Capacity available
✓ Pickup window compatible
✓ High current need
```

ReServe also explains why an organization received its recommendation instead of displaying only a score.

---

## 🤖 AI Usage

AI is used to help structure unorganized food descriptions entered by donors.

Example input:

```text
We have around 35 pounds of vegetarian pasta left from an event.
It has been refrigerated.
```

Example structured output:

```json
{
  "food_name": "Vegetarian Pasta",
  "food_category": "prepared_food",
  "quantity_lbs": 35,
  "storage_type": "refrigerated",
  "dietary_tags": ["vegetarian"]
}
```

Safety-critical information such as allergens, expiration deadlines, preparation time, and storage confirmation must still be verified by the donor.

The final recipient decision is made by ReServe's deterministic matching engine.

---

## 🛠 Tech Stack

### Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS

### Backend

* Next.js API Routes / Server Actions
* Supabase

### Database

* PostgreSQL
* Supabase

### Authentication

* Supabase Auth

### AI

* OpenAI API

### Maps

* Leaflet
* OpenStreetMap

### Deployment

* Vercel

### Development

* Git
* GitHub
* GitHub Projects

---

## 📂 Project Structure

```text
reserve/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── logo/
│
├── docs/
│   ├── 01-problem.md
│   ├── 02-product-requirements.md
│   ├── 03-system-architecture.md
│   ├── 04-data-model.md
│   ├── 05-matching-engine.md
│   ├── 06-api-documentation.md
│   ├── 07-ai-design.md
│   ├── 08-food-safety.md
│   ├── 09-testing.md
│   └── 10-demo-script.md
│
├── src/
│   ├── app/
│   │   ├── donate/
│   │   ├── matches/
│   │   ├── rescue/
│   │   ├── dashboard/
│   │   ├── recipient/
│   │   └── api/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── donation/
│   │   ├── matching/
│   │   ├── rescue/
│   │   └── dashboard/
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   ├── matching/
│   │   └── ai/
│   │
│   ├── types/
│   └── data/
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── schema.sql
│
├── tests/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Database

ReServe uses the following main tables:

```text
organizations
donations
recipient_preferences
matches
rescues
```

### Donations

Stores information about donated food.

```text
food_name
food_category
quantity_lbs
storage_type
allergens
dietary_tags
prepared_at
pickup_deadline
location
status
```

### Recipient Preferences

Stores information about what each organization can receive.

```text
accepted_categories
storage_capabilities
capacity_lbs
pickup_radius_miles
needs_score
open_time
close_time
```

### Matches

Stores the calculated recipient recommendations.

```text
distance_score
need_score
capacity_score
pickup_score
food_score
final_score
explanation
status
```

### Rescues

Tracks the donation after it has been accepted.

```text
accepted_at
picked_up_at
delivered_at
quantity_rescued
```

---

## 🔌 API

Core endpoints include:

```text
POST   /api/donations

GET    /api/donations/:id

POST   /api/donations/:id/match

GET    /api/donations/:id/matches

POST   /api/matches/:id/accept

POST   /api/rescues/:id/pickup

POST   /api/rescues/:id/deliver

GET    /api/dashboard/impact
```

---

## 🚦 Donation Status

A donation moves through the following lifecycle:

```text
AVAILABLE
    ↓
MATCHED
    ↓
ACCEPTED
    ↓
PICKED_UP
    ↓
DELIVERED
```

---

## 📊 Impact Tracking

The dashboard tracks metrics such as:

```text
Total Food Rescued

Estimated Meals Provided

Completed Rescues

Average Match Time
```

Estimated meals can be calculated from the total amount of successfully rescued food.

Prototype or seeded statistics should be clearly identified as demo data.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/reserve.git
```

### 2. Enter the project directory

```bash
cd reserve
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create environment variables

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🧪 Testing

The matching engine should be tested against scenarios including:

```text
Normal donation

Expired donation

No compatible recipient

Large donation

Refrigerated donation

Recipient at capacity

Recipient closed

Missing donation information
```

Run tests with:

```bash
npm test
```

---

## 🎬 Demo Scenario

Example competition demo:

```text
Donation:

35 lbs of refrigerated vegetarian pasta

Pickup Deadline:

7:30 PM
```

ReServe evaluates nearby organizations and returns ranked recommendations.

```text
BEST MATCH

Community Food Organization

94% Match

2.1 miles away

✓ Food type accepted
✓ Refrigerated storage available
✓ Capacity available
✓ Pickup window compatible
✓ High current need
```

The donor confirms the recipient, the organization accepts the donation, and the rescue is tracked until delivery.

The impact dashboard then updates automatically.

---

## 🔮 Future Roadmap

Possible future improvements include:

* Volunteer driver coordination
* Real-time pickup routing
* SMS and email notifications
* Dynamic recipient need levels
* Multi-donor coordination
* Predictive food surplus analytics
* University dining integrations
* Grocery store integrations
* Food bank integrations
* Organization verification
* Advanced impact analytics
* Mobile application
* Regional expansion

---

## 🎯 Vision

ReServe aims to become a coordination layer between organizations with surplus food and community organizations that can use it.

The goal is simple:

> **Get good food to the right place before it becomes waste.**

---

## 👥 Team

Built by a Anish, Shiva and Prajwal - Iowa State University students for the **Start Something Weekend Challenge**.
