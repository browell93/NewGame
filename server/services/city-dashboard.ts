type QueryError = { message: string } | null;

type QueryBuilder<T> = Promise<{ data: T | null; error: QueryError }>;

type SingleQueryBuilder<T> = {
  eq: (column: string, value: string) => SingleQueryBuilder<T>;
  maybeSingle: () => QueryBuilder<T>;
  order?: (column: string, options?: { ascending?: boolean }) => SingleQueryBuilder<T>;
};

type ListQueryBuilder<T> = {
  eq: (column: string, value: string) => ListQueryBuilder<T>;
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder<T[]>;
};

type DashboardClient = {
  from: (table: string) => {
    select: (columns: string) => SingleQueryBuilder<unknown> | ListQueryBuilder<unknown>;
  };
};

type CityRow = {
  id: string;
  name: string;
  region_key: string;
};

type ProfileRow = {
  beginner_protection_ends_at: string;
  protection_break_reason: string | null;
};

type ResourceRow = {
  food: number;
  gold: number;
  iron: number;
  lumber: number;
  stone: number;
};

type PopulationRow = {
  current_population: number;
  idle_population: number;
  loyalty: number;
  max_population: number;
  tax_rate: number;
  unrest: number;
};

type CityBuildingRow = {
  building_key: string;
  level: number;
  building_definitions: {
    category: string;
    name: string;
  } | null;
};

export type PrimaryCityDashboard = {
  city: {
    id: string;
    name: string;
    regionKey: string;
  };
  protection: {
    endsAtIso: string;
    breakReason: string | null;
  };
  resources: {
    food: number;
    gold: number;
    iron: number;
    lumber: number;
    stone: number;
  };
  population: {
    currentPopulation: number;
    idlePopulation: number;
    loyalty: number;
    maxPopulation: number;
    taxRate: number;
    unrest: number;
  };
  buildings: Array<{
    category: string;
    key: string;
    level: number;
    name: string;
  }>;
};

function throwIfError(error: QueryError, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

export async function getPrimaryCityDashboard(client: unknown, userId: string): Promise<PrimaryCityDashboard | null> {
  const db = client as DashboardClient;
  const cityQuery = db
    .from("cities")
    .select("id, name, region_key") as SingleQueryBuilder<CityRow>;
  const { data: city, error: cityError } = await cityQuery.eq("player_id", userId).maybeSingle();
  throwIfError(cityError, "Could not load city");

  if (!city) {
    return null;
  }

  const profileQuery = db
    .from("player_profiles")
    .select("beginner_protection_ends_at, protection_break_reason") as SingleQueryBuilder<ProfileRow>;
  const { data: profile, error: profileError } = await profileQuery.eq("user_id", userId).maybeSingle();
  throwIfError(profileError, "Could not load player protection state");

  const resourcesQuery = db
    .from("city_resources")
    .select("food, gold, iron, lumber, stone") as SingleQueryBuilder<ResourceRow>;
  const { data: resources, error: resourcesError } = await resourcesQuery.eq("city_id", city.id).maybeSingle();
  throwIfError(resourcesError, "Could not load city resources");

  const populationQuery = db
    .from("city_population_state")
    .select("current_population, idle_population, loyalty, max_population, tax_rate, unrest") as SingleQueryBuilder<PopulationRow>;
  const { data: population, error: populationError } = await populationQuery.eq("city_id", city.id).maybeSingle();
  throwIfError(populationError, "Could not load city population");

  const buildingsQuery = db
    .from("city_buildings")
    .select("building_key, level, building_definitions(name, category)") as ListQueryBuilder<CityBuildingRow>;
  const { data: buildings, error: buildingsError } = await buildingsQuery.eq("city_id", city.id).order("building_key", { ascending: true });
  throwIfError(buildingsError, "Could not load city buildings");

  if (!resources || !population || !profile) {
    throw new Error("City records are incomplete after bootstrap.");
  }

  return {
    city: {
      id: city.id,
      name: city.name,
      regionKey: city.region_key,
    },
    resources,
    protection: {
      endsAtIso: profile.beginner_protection_ends_at,
      breakReason: profile.protection_break_reason,
    },
    population: {
      currentPopulation: population.current_population,
      idlePopulation: population.idle_population,
      loyalty: population.loyalty,
      maxPopulation: population.max_population,
      taxRate: population.tax_rate,
      unrest: population.unrest,
    },
    buildings: (buildings ?? []).map((building) => ({
      category: building.building_definitions?.category ?? "Unknown",
      key: building.building_key,
      level: building.level,
      name: building.building_definitions?.name ?? building.building_key,
    })),
  };
}
