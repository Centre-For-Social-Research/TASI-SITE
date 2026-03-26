import { createClient } from '@supabase/supabase-js';

let client;

export function getSupabaseAdmin() {
  if (client) {
    return client;
  }

  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error(
      'Missing SUPABASE_URL for server-side Supabase admin client.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY for server-side Supabase admin client.'
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}
