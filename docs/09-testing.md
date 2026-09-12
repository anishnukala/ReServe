# Testing

Unit tests verify that hard filters reject incompatible capacity and storage, matching weights sum to one, and higher current need and semantic fit improve ranking. Type checking covers API contracts and map components. A production build verifies server/client boundaries and route generation.

Run:

```bash
npm test
npm exec -- tsc --noEmit --incremental false
npm run build
npm audit --audit-level=high
```

Atlas setup is verified separately with `npm run db:setup` because it requires network access and valid credentials.
