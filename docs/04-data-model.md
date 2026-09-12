# MongoDB data model

- `users`: identity, password hash, role, account status, and linked organization.
- `organizations`: operational profile, GeoJSON location, capacity, receiving hours, status, verification, rating, and cached embedding metadata.
- `organization_needs`: current quantities, desired quantities, urgency, storage, dietary tags, expiration, and active state.
- `donations`: donor-confirmed food details, GeoJSON pickup point, radius, deadline, selected match, and workflow status.
- `matches`: ranked recipient, distance, AI similarity, deterministic breakdown, grounded reasons, and selection status.
- `rescues`: accepted, picked-up, and delivered milestones with rescued pounds.

GeoJSON points always use `[longitude, latitude]`. `organizations.location` has a `2dsphere` index. Email, organization owner, donation match, and rescue identities have unique indexes where appropriate.
