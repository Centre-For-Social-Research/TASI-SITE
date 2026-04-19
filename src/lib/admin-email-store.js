import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function getStoredAdminEmails() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('admin_email_overrides')
      .select('email, role')
      .order('created_at', { ascending: true });
    if (error) return { adminEmails: [], reviewerEmails: [] };
    const adminEmails = (data || []).filter((r) => r.role === 'admin').map((r) => r.email);
    const reviewerEmails = (data || []).filter((r) => r.role === 'reviewer').map((r) => r.email);
    return { adminEmails, reviewerEmails };
  } catch {
    return { adminEmails: [], reviewerEmails: [] };
  }
}

export async function addStoredEmail(email, role, addedBy) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('admin_email_overrides')
    .upsert(
      { email: email.toLowerCase().trim(), role, added_by: addedBy },
      { onConflict: 'email' }
    );
  return !error;
}

export async function removeStoredEmail(email) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('admin_email_overrides')
    .delete()
    .eq('email', email.toLowerCase().trim());
  return !error;
}
