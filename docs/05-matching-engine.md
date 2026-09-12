# Matching engine

The engine first retrieves organizations within the donor’s chosen radius. It rejects unavailable organizations and those that fail category, storage, capacity, deadline, receiving-hour, or distance checks.

Eligible organizations receive scores using weights defined once in `src/lib/ai/scoring.ts`: semantic similarity 20%, current need 25%, food fit 15%, pickup feasibility 15%, distance 10%, capacity 10%, and verification/rating 5%.

Organization embeddings are cached with their model name and a hash of the source profile. Profile or needs updates invalidate that cache. Explanations are generated only from fields present in MongoDB.
