import type { User } from "@supabase/supabase-js";

type StarterCityRpcResult = {
  city_id: string;
  created: boolean;
};

type RpcCapableClient = {
  rpc: (
    functionName: string,
    args: {
      p_display_name: string;
      p_user_id: string;
    },
  ) => PromiseLike<{ data: StarterCityRpcResult[] | null; error: { message: string } | null }>;
};

export function deriveDisplayName(user: Pick<User, "email" | "user_metadata">) {
  const metadataName = user.user_metadata?.display_name;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim().slice(0, 32);
  }

  const emailLocalPart = user.email?.split("@")[0]?.trim();
  return emailLocalPart?.slice(0, 32) || "Frontier Ruler";
}

export async function ensureStarterCityForUser(client: RpcCapableClient, user: User) {
  const { data, error } = await client.rpc("create_starter_city_for_user", {
    p_user_id: user.id,
    p_display_name: deriveDisplayName(user),
  });

  if (error) {
    throw new Error(`Failed to bootstrap starter city: ${error.message}`);
  }

  return data?.[0] ?? null;
}
