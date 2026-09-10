# Data Model

## organizations

Identity and location of an organization. A `google_place_id` may be stored when a location comes from Google Places.

## recipient_preferences

ReServe-owned operational data:

- accepted food categories
- storage capabilities
- capacity
- pickup radius
- need score
- operating window

## donations

- food name/category
- quantity
- storage type
- allergens
- dietary tags
- preparation/packaging time
- pickup deadline
- location
- donor safety confirmation
- status

## matches

Stores the score components and explanation for each ranked recipient.

## rescues

Tracks acceptance, pickup, delivery, and rescued quantity.

See `../supabase/schema.sql` for executable SQL.
