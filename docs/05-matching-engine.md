# Matching Engine

## Phase 1: hard filters

A recipient is removed when:

- the food category is not accepted
- required storage is unavailable
- capacity is below the donation quantity
- distance exceeds the pickup radius
- the donation deadline has passed
- the recipient is closed during the pickup window

## Phase 2: weighted ranking

```text
30% Need Match
25% Pickup Feasibility
20% Distance
15% Capacity Match
10% Food Preference Match
```

## Explainability

The UI displays the final score, score breakdown, distance, and human-readable reasons.

## Limitations

- `needs_score` is prototype data until recipients update it from a real workflow.
- operating hours are simplified to integer hours.
- pickup feasibility is currently a heuristic, not a routing ETA.
- distance uses the Haversine formula, not live driving distance.
- the score does not determine food safety.
