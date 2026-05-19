const requiredSupabaseEnvNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
] as const;

type SupabaseEnvName = (typeof requiredSupabaseEnvNames)[number] | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export type SupabaseEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function getMissingSupabaseEnvNames() {
  const missing: string[] = requiredSupabaseEnvNames.filter((name) => !process.env[name]);

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return missing;
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
    supabaseAnonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      readRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}
