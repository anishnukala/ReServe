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

## Service resilience

- return a configuration error without MongoDB
- return a configuration error without Google Places
- use deterministic extraction without OpenAI
- preserve transaction consistency when a workflow update fails
