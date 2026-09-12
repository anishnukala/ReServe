# API Documentation

## POST /api/donations

Creates a donation.

## POST /api/donations/:id/match

Loads the donation and recipient preferences from MongoDB, then runs feasibility filters and ranking.

## POST /api/matches/:id/accept

Accepts a match and creates a rescue.

## POST /api/rescues/:id/pickup

Marks a rescue as picked up.

## POST /api/rescues/:id/deliver

Marks a rescue as delivered.

## GET /api/dashboard/impact

Returns total delivered food, estimated meals, rescue count, and average match time placeholder.

## POST /api/places/search

Server-side Google Places Text Search adapter. Returns a configuration error when the Google API key is unavailable.

## POST /api/ai/extract-food

Optional natural-language extraction. Falls back to a basic deterministic parser when OpenAI is disabled.
