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
Supabase PostgreSQL
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

### Supabase

- organizations
- recipient preferences
- donations
- matches
- rescues

### Google Places

- live discovery of nearby candidate organizations

### OpenAI

- optional extraction of explicitly stated food details from natural language
- never food-safety certification
