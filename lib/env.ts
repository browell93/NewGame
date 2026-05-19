const requiredSupabaseEnvNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type SupabaseEnvName = (typeof requiredSupabaseEnvNames)[number];

export type SupabaseEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function getMissingSupabaseEnvNames() {
  return requiredSupabaseEnvNames.filter((name) => !process.env[name]);
}

export function isSupabaseConfigured() {
  return getMissingSupabaseEnvNames().length === 0;
}

function readRequiredEnv(name: SupabaseEnvName) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in Vercel Project Settings > Environment Variables and redeploy.`,
    );
  }

  return value;
}

export function getSupabaseEnv(): SupabaseEnv {
  const missingEnvNames = getMissingSupabaseEnvNames();

  if (missingEnvNames.length > 0) {
    throw new Error(
      `Missing required environment variable${missingEnvNames.length === 1 ? "" : "s"}: ${missingEnvNames.join(
        ", ",
      )}. Set ${missingEnvNames.length === 1 ? "it" : "them"} in Vercel Project Settings > Environment Variables and redeploy.`,
    );
  }

  return {
    supabaseUrl: readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
