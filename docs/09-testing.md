# Testing Plan

## Matching cases

- normal donation
- expired donation
- no compatible recipient
- oversized donation
- refrigerated food
- frozen food
- unsupported category
- recipient closed
- outside pickup radius
- missing data

## API validation

- invalid coordinates
- invalid quantities
- past deadlines
- missing donor safety confirmation
- external API failure

## Demo resilience

- run with `DEMO_MODE=true`
- run without Google API
- run without OpenAI API
- keep a backup screen recording for the competition
