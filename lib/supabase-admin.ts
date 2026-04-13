import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

function getRequiredServerEnv(
  name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = getRequiredServerEnv("SUPABASE_URL");
  const supabaseServiceRoleKey = getRequiredServerEnv(
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}
