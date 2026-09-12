# System architecture

The Next.js frontend calls Route Handlers for auth, donations, organization profiles, matching, rescues, and analytics. MongoDB Atlas is the source of truth.

Nearby candidates come from a MongoDB `$geoNear` query over GeoJSON points. Hard eligibility filters run before embeddings. Transformers.js creates local sentence embeddings for eligible candidates, and the scoring layer combines semantic similarity with needs, compatibility, pickup feasibility, distance, capacity, and organization trust. Results appear in reusable Leaflet maps backed by OpenStreetMap tiles.

Sessions use signed JWTs stored only in HTTP-only cookies. Every private route checks the user and role on the server.
