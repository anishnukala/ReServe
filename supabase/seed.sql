-- Fictional prototype organizations. Replace with verified organizations before a real deployment.
insert into organizations (id, name, type, address, latitude, longitude, reserve_verified) values
('org-1', 'Demo Ames Community Pantry', 'FOOD_PANTRY', 'Ames, IA', 42.0308, -93.6319, false),
('org-2', 'Demo Central Iowa Shelter', 'SHELTER', 'Ames, IA', 42.0224, -93.6171, false),
('org-3', 'Demo Campus Community Kitchen', 'NONPROFIT', 'Ames, IA', 42.0266, -93.6465, false),
('org-4', 'Demo Story County Food Support', 'FOOD_PANTRY', 'Ames, IA', 42.0461, -93.6128, false),
('org-5', 'Demo North Ames Resource Center', 'NONPROFIT', 'Ames, IA', 42.0572, -93.6402, false)
on conflict (id) do nothing;

insert into recipient_preferences
(organization_id, accepted_categories, storage_capabilities, capacity_lbs, pickup_radius_miles, needs_score, open_hour, close_hour)
values
('org-1', array['prepared_food','produce','bakery','packaged_food'], array['ambient','refrigerated','frozen'], 120, 12, 96, 8, 20),
('org-2', array['prepared_food','packaged_food','bakery'], array['ambient','refrigerated'], 75, 9, 88, 7, 22),
('org-3', array['prepared_food','produce','bakery'], array['ambient','refrigerated'], 55, 7, 84, 9, 19),
('org-4', array['produce','packaged_food','bakery'], array['ambient','refrigerated','frozen'], 200, 15, 78, 8, 18),
('org-5', array['prepared_food','produce','packaged_food'], array['ambient','refrigerated'], 90, 10, 91, 10, 21)
on conflict (organization_id) do nothing;
