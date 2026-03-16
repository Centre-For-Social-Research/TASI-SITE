import { createClient } from "@supabase/supabase-js";

let client;

export function getSupabaseAdmin() {
  if (client) {
    return client;
  }

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const key =
    serviceRoleKey && serviceRoleKey !== "REPLACE_WITH_SERVICE_ROLE_SECRET_KEY"
      ? serviceRoleKey
      : publishableKey;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL and key. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_PUBLISHABLE_KEY"
    );
  }

  client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}