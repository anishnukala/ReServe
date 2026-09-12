# System Architecture

```text
Browser
  │
  ├── Donor UI
  ├── Match UI
  ├── Recipient UI
  └── Impact UI
  │
Next.js App Router
  │
  ├── API routes / server logic
  ├── Deterministic matching engine
  ├── Google Places adapter
  └── Optional OpenAI extraction
  │
MongoDB
```

## Responsibilities

### Next.js

- UI
- API validation
- workflow orchestration
- server-side external API calls

### Matching engine

- hard feasibility filters
- scoring
- explanations

### MongoDB

- organizations
- recipient preferences
- donations
- matches
- rescues

The server uses one shared MongoDB connection pool. Multi-collection workflow updates run in transactions, while collection validators and indexes are installed by `npm run db:setup`.

### Google Places

- live discovery of nearby candidate organizations

### OpenAI

- optional extraction of explicitly stated food details from natural language
- never food-safety certification
