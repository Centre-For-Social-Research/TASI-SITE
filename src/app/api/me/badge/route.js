import { auth, currentUser } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const SELECT = `
  id,
  registration_code,
  first_name,
  last_name,
  status,
  attendee_category,
  qr_pass_issued_at,
  checked_in_at,
  created_at
`;

const CONFIRMED_STATUS_ALIASES = new Set(['confirmed', 'approved', 'accepted', 'paid']);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeStatus(row) {
  const status = String(row?.status || '').trim().toLowerCase();
  if (CONFIRMED_STATUS_ALIASES.has(status) || row?.qr_pass_issued_at) return 'confirmed';
  if (['pending', 'waitlisted', 'rejected'].includes(status)) return status;
  return 'unregistered';
}

function chooseRegistration(rows) {
  return rows.find((row) => normalizeStatus(row) === 'confirmed')
    || rows.find((row) => normalizeStatus(row) === 'pending')
    || rows.find((row) => normalizeStatus(row) === 'waitlisted')
    || rows[0]
    || null;
}

export async function GET() {
  const session = await auth();
  if (!session?.userId) {
    return Response.json({ error: 'Please sign in.' }, { status: 401 });
  }

  const user = await currentUser();
  const emails = (user?.emailAddresses || [])
    .map((entry) => normalizeEmail(entry.emailAddress))
    .filter(Boolean);

  if (emails.length === 0) {
    return Response.json({ success: true, state: 'unregistered', registration: null });
  }

  const supabase = getSupabaseAdmin();
  const emailFilter = emails
    .map((email) => `email.ilike.${email.replaceAll(',', '').replaceAll('%', '\\%').replaceAll('*', '\\*')}`)
    .join(',');
  const { data, error } = await supabase
    .from('event_registrations')
    .select(SELECT)
    .or(emailFilter)
    .order('qr_pass_issued_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Unable to load attendee badge.', error);
    return Response.json({ error: 'Unable to load badge.' }, { status: 500 });
  }

  const registration = chooseRegistration(data || []);

  return Response.json({
    success: true,
    state: registration ? normalizeStatus(registration) : 'unregistered',
    registration,
  });
}
