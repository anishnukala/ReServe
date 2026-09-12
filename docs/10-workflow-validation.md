# Workflow Validation

1. Create a donation with a future pickup deadline.
2. Confirm compatible recipients are loaded from MongoDB and ranked.
3. Accept one match and verify that a rescue is created.
4. Mark the rescue as picked up, then delivered.
5. Confirm the delivered quantity appears on the impact dashboard.

ReServe filters for operational feasibility and explains why a recipient is a strong match. Validation records should be removed after automated or manual verification.
