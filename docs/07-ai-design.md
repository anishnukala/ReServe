# AI Design

AI is optional and limited to extracting explicit facts from donor descriptions.

Example:

```text
"We have about 35 pounds of vegetarian pasta from an event. It is refrigerated."
```

Possible structured fields:

```json
{
  "foodName": "vegetarian pasta",
  "foodCategory": "prepared_food",
  "quantityLbs": 35,
  "storageType": "refrigerated",
  "dietaryTags": ["vegetarian"]
}
```

## Safety boundary

The model must not infer or certify:

- expiration
- allergens not stated by the donor
- safe internal temperature
- whether food is wholesome
- legal compliance
- whether the donation should be eaten

The donor verifies safety-critical information. The recipient independently decides whether to accept the food.
