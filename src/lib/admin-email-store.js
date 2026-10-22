import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Every admin request checks this list, so keep it in memory briefly instead of
// a database round trip each time. Changes made on this instance clear it at once;
// other warm instances pick a change up within the TTL.
const STORED_EMAILS_TTL_MS = 30_000;
let storedEmailsCache = null;

async function loadStoredAdminEmails() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('admin_email_overrides')
    .select('email, role')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return {
    adminEmails: (data || [])
      .filter((r) => r.role === 'admin')
      .map((r) => r.email),
    reviewerEmails: (data || [])
      .filter((r) => r.role === 'reviewer')
      .map((r) => r.email),
  };
}

export async function getStoredAdminEmails() {
  const now = Date.now();
  if (storedEmailsCache && storedEmailsCache.expiresAt > now) {
    return storedEmailsCache.value;
  }

  // Concurrent requests share one lookup. A failure is not cached: those
  // requests fall back to the env lists and the next one tries again.
  const pending = loadStoredAdminEmails().catch((error) => {
    console.error('Unable to load stored operator emails.', error);
    if (storedEmailsCache?.value === pending) storedEmailsCache = null;
    return { adminEmails: [], reviewerEmails: [] };
  });
  storedEmailsCache = { value: pending, expiresAt: now + STORED_EMAILS_TTL_MS };
  return pending;
}

function clearStoredAdminEmails() {
  storedEmailsCache = null;
}

export async function addStoredEmail(email, role, addedBy) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('admin_email_overrides')
    .upsert(
      { email: email.toLowerCase().trim(), role, added_by: addedBy },
      { onConflict: 'email' }
    );
  clearStoredAdminEmails();
  return !error;
}

export async function removeStoredEmail(email) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('admin_email_overrides')
    .delete()
    .eq('email', email.toLowerCase().trim());
  clearStoredAdminEmails();
  return !error;
}
