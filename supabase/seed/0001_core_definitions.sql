insert into public.building_definitions (key, name, category, description, base_build_seconds, sort_order)
values
  ('town_hall', 'Town Hall', 'Government', 'Coordinates city administration and unlocks progression.', 60, 10),
  ('cottage', 'Cottage', 'Population', 'Raises the city population ceiling.', 45, 20),
  ('warehouse', 'Warehouse', 'Economy', 'Protects stored resources from future raids.', 75, 30),
  ('inn', 'Inn', 'Heroes', 'Will host recruitable heroes in a later milestone.', 90, 40),
  ('hero_hall', 'Hero Hall', 'Heroes', 'Will store owned heroes and assignments.', 120, 50),
  ('embassy', 'Embassy', 'Alliance', 'Will unlock alliance and reinforcement interactions.', 120, 60),
  ('marketplace', 'Marketplace', 'Trade', 'Will support market transactions and resource exchange.', 120, 70),
  ('academy', 'Academy', 'Research', 'Unlocks technologies and research queues.', 90, 80),
  ('rally_spot', 'Rally Spot', 'Military', 'Will manage outgoing marches and capacity.', 90, 90),
  ('barracks', 'Barracks', 'Military', 'Will train troops and host training queues.', 90, 100),
  ('beacon_tower', 'Beacon Tower', 'Intelligence', 'Will improve scouting and incoming attack alerts.', 120, 110),
  ('forge', 'Forge', 'Military', 'Will satisfy prerequisites for advanced units.', 120, 120),
  ('stable', 'Stable', 'Military', 'Will support mounted units and cavalry prerequisites.', 120, 130),
  ('workshop', 'Workshop', 'Military', 'Will support siege units and advanced production.', 150, 140),
  ('walls', 'Walls', 'Defense', 'Will provide fortification capacity and defensive value.', 150, 150)
on conflict (key) do update
set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  base_build_seconds = excluded.base_build_seconds,
  sort_order = excluded.sort_order;

insert into public.resource_field_definitions (
  key,
  name,
  resource_key,
  description,
  base_output_per_hour,
  workforce_required,
  base_upgrade_seconds,
  sort_order
)
values
  ('farm', 'Farm', 'food', 'Generates food for city growth and future troop upkeep.', 120, 20, 45, 10),
  ('sawmill', 'Sawmill', 'lumber', 'Produces lumber for construction and troop production.', 100, 18, 45, 20),
  ('quarry', 'Quarry', 'stone', 'Extracts stone for fortifications and buildings.', 90, 18, 45, 30),
  ('iron_mine', 'Iron Mine', 'iron', 'Extracts iron for military development.', 75, 20, 45, 40)
on conflict (key) do update
set
  name = excluded.name,
  resource_key = excluded.resource_key,
  description = excluded.description,
  base_output_per_hour = excluded.base_output_per_hour,
  workforce_required = excluded.workforce_required,
  base_upgrade_seconds = excluded.base_upgrade_seconds,
  sort_order = excluded.sort_order;
