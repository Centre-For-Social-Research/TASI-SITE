import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { getStoredAdminEmails, addStoredEmail, removeStoredEmail } from '@/lib/admin-email-store';

export async function GET() {
  const authResult = await requireAuthorizedOperator({ route: 'api.admin.settings' });
  if (!authResult.ok) return authResult.response;

  const accessMode = process.env.CLERK_ACCESS_MODE || 'both';
  const envAdminEmails = (process.env.CLERK_ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const envReviewerEmails = (process.env.CLERK_REVIEWER_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean);

  const stored = await getStoredAdminEmails();

  const allAdminEmails = [
    ...envAdminEmails.map((e) => ({ email: e, source: 'env' })),
    ...stored.adminEmails.filter((e) => !envAdminEmails.includes(e)).map((e) => ({ email: e, source: 'db' })),
  ];
  const allReviewerEmails = [
    ...envReviewerEmails.map((e) => ({ email: e, source: 'env' })),
    ...stored.reviewerEmails.filter((e) => !envReviewerEmails.includes(e)).map((e) => ({ email: e, source: 'db' })),
  ];

  const integrations = [
    { key: 'supabase',  label: 'Supabase',  ok: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY), optional: false },
    { key: 'clerk',     label: 'Clerk',     ok: Boolean(process.env.CLERK_SECRET_KEY), optional: false },
    { key: 'razorpay',  label: 'Razorpay',  ok: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET), optional: false },
    { key: 'resend',    label: 'Resend',    ok: Boolean(process.env.RESEND_API_KEY), optional: false },
    { key: 'upstash',   label: 'Upstash',   ok: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN), optional: true },
    { key: 'sentry',    label: 'Sentry',    ok: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN), optional: true },
  ];

  return Response.json({
    ok: true,
    data: {
      access: {
        mode: accessMode,
        adminEmails: allAdminEmails,
        reviewerEmails: allReviewerEmails,
      },
      rateLimits: [
        { label: 'Public POST', value: '5 req / 10 min per IP' },
        { label: 'Admin routes', value: '60 req / min' },
        { label: 'Check-in', value: '240 req / min' },
        { label: 'Upstash fallback', value: 'In-memory (dev)' },
      ],
      integrations,
      event: {
        name: 'Trust & Safety India Festival',
        shortName: 'TASI 2026',
        dates: 'Oct 13–14, 2026',
        venue: 'India Habitat Centre, New Delhi',
        capacity: 450,
        waitlistOpen: true,
        vipDeskEnabled: true,
      },
    },
  });
}

export async function PATCH(request) {
  const authResult = await requireAuthorizedOperator({ route: 'api.admin.settings' });
  if (!authResult.ok) return authResult.response;
  if (authResult.operator?.role !== 'admin') {
    return Response.json({ ok: false, error: 'Admin role required' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, email, role } = body;
  const actorEmail = authResult.operator?.primaryEmail || 'unknown';

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return Response.json({ ok: false, error: 'Valid email required' }, { status: 400 });
  }

  const envAdminEmails = (process.env.CLERK_ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const envReviewerEmails = (process.env.CLERK_REVIEWER_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const normalised = email.toLowerCase().trim();

  if (action === 'add') {
    if (!role || !['admin', 'reviewer'].includes(role)) {
      return Response.json({ ok: false, error: 'Role must be admin or reviewer' }, { status: 400 });
    }
    const ok = await addStoredEmail(normalised, role, actorEmail);
    return Response.json({ ok, error: ok ? undefined : 'Failed to save' });
  }

  if (action === 'remove') {
    if (envAdminEmails.includes(normalised) || envReviewerEmails.includes(normalised)) {
      return Response.json({ ok: false, error: 'Env-var emails cannot be removed here — update CLERK_ADMIN_EMAILS or CLERK_REVIEWER_EMAILS in your environment.' }, { status: 400 });
    }
    const ok = await removeStoredEmail(normalised);
    return Response.json({ ok, error: ok ? undefined : 'Failed to remove' });
  }

  return Response.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}
