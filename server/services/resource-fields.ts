export type ResourceFieldState = {
  id: string;
  fieldKey: string;
  level: number;
  plotIndex: number;
};

export type ResourceFieldUpgradeQueue = {
  id: string;
  fieldId: string;
  targetLevel: number;
  status: string;
  endsAt: string;
};

type FieldsClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function getCityResourceFields(client: FieldsClient, cityId: string): Promise<{ fields: ResourceFieldState[]; queues: ResourceFieldUpgradeQueue[] }> {
  const fieldsResult = await client
    .from("resource_fields")
    .select("id, field_key, level, plot_index")
    .eq("city_id", cityId)
    .order("plot_index", { ascending: true });

  if (fieldsResult.error) throw new Error(`Could not load resource fields: ${fieldsResult.error.message}`);

  const queueResult = await client
    .from("resource_field_upgrade_queues")
    .select("id, field_id, target_level, status, ends_at")
    .eq("city_id", cityId)
    .order("created_at", { ascending: true });

  if (queueResult.error) throw new Error(`Could not load resource field queues: ${queueResult.error.message}`);

  const fields = ((fieldsResult.data ?? []) as Array<{ id: string; field_key: string; level: number; plot_index: number }>).map((f) => ({
    id: f.id,
    fieldKey: f.field_key,
    level: f.level,
    plotIndex: f.plot_index,
  }));

  const queues = ((queueResult.data ?? []) as Array<{ id: string; field_id: string; target_level: number; status: string; ends_at: string }>).map((q) => ({
    id: q.id,
    fieldId: q.field_id,
    targetLevel: q.target_level,
    status: q.status,
    endsAt: q.ends_at,
  }));

  return { fields, queues };
}
