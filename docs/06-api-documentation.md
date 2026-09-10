# API Documentation

## POST /api/donations

Creates a donation.

## POST /api/donations/:id/match

Runs feasibility filters and ranking. In demo mode, the client includes the donation object in the request body.

## POST /api/matches/:id/accept

Accepts a match and creates a rescue.

## POST /api/rescues/:id/pickup

Marks a rescue as picked up.

## POST /api/rescues/:id/deliver

Marks a rescue as delivered.

## GET /api/dashboard/impact

Returns total delivered food, estimated meals, rescue count, and average match time placeholder.

## POST /api/places/search

Server-side Google Places Text Search adapter. Falls back to fictional organizations in demo mode.

## POST /api/ai/extract-food

Optional natural-language extraction. Falls back to a basic deterministic parser when OpenAI is disabled.
