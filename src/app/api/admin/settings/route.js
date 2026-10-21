import { revalidatePath } from 'next/cache';
import { requireAuthorizedOperator } from '@/lib/registration-auth';
import {
  getStoredAdminEmails,
  addStoredEmail,
  removeStoredEmail,
} from '@/lib/admin-email-store';
import { recordAdminAuditEvent } from '@/lib/admin-audit';
import {
  getAzureWhatsAppConfig,
  isAzureWhatsAppConfigured,
} from '@/lib/azure-whatsapp';
import { getFormStatuses, setFormOpen } from '@/lib/form-settings';
import formSettings from '@/lib/form-settings.cjs';

const { PUBLIC_FORMS, isPublicFormKey } = formSettings;

export async function GET() {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.settings',
  });
  if (!authResult.ok) return authResult.response;

  const accessMode = 'email_allowlist';
  const envAdminEmails = (process.env.CLERK_ADMIN_EMAILS || '')
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const envReviewerEmails = (process.env.CLERK_REVIEWER_EMAILS || '')
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const [stored, forms] = await Promise.all([
    getStoredAdminEmails(),
    getFormStatuses(),
  ]);
  const azureWhatsApp = getAzureWhatsAppConfig();

  const allAdminEmails = [
    ...envAdminEmails.map((e) => ({ email: e, source: 'env' })),
    ...stored.adminEmails
      .filter((e) => !envAdminEmails.includes(e))
      .map((e) => ({ email: e, source: 'db' })),
  ];
  const allReviewerEmails = [
    ...envReviewerEmails.map((e) => ({ email: e, source: 'env' })),
    ...stored.reviewerEmails
      .filter((e) => !envReviewerEmails.includes(e))
      .map((e) => ({ email: e, source: 'db' })),
  ];

  const integrations = [
    {
      key: 'supabase',
      label: 'Supabase',
      ok: Boolean(
        process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
      optional: false,
    },
    {
      key: 'clerk',
      label: 'Clerk',
      ok: Boolean(process.env.CLERK_SECRET_KEY),
      optional: false,
    },
    {
      key: 'resend',
      label: 'Resend',
      ok: Boolean(process.env.RESEND_API_KEY),
      optional: false,
    },
    {
      key: 'azure-whatsapp',
      label: 'Azure WhatsApp',
      ok:
        isAzureWhatsAppConfigured(azureWhatsApp) &&
        Boolean(
          azureWhatsApp.templateByType.confirmed &&
          azureWhatsApp.templateByType.qr_pass_issued
        ),
      optional: true,
    },
    {
      key: 'upstash',
      label: 'Upstash',
      ok: Boolean(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
      ),
      optional: true,
    },
    {
      key: 'sentry',
      label: 'Sentry',
      ok: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
      optional: true,
    },
  ];

  // Reviewers get a read-only view without the operator email lists.
  const isAdmin = authResult.operator?.role === 'admin';

  return Response.json({
    ok: true,
    data: {
      canEdit: isAdmin,
      forms,
      access: {
        mode: accessMode,
        adminEmails: isAdmin ? allAdminEmails : [],
        reviewerEmails: isAdmin ? allReviewerEmails : [],
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
        dates: 'Oct 14–15, 2026',
        venue: 'India International Centre, New Delhi',
        capacity: 450,
        waitlistOpen: true,
        vipDeskEnabled: true,
      },
    },
  });
}

export async function PATCH(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.settings',
  });
  if (!authResult.ok) return authResult.response;
  if (authResult.operator?.role !== 'admin') {
    return Response.json(
      { ok: false, error: 'Admin role required' },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, email, role } = body;
  const actorEmail = authResult.operator?.primaryEmail || 'unknown';

  if (action === 'set_form') {
    const { formKey, open } = body;
    if (!isPublicFormKey(formKey) || typeof open !== 'boolean') {
      return Response.json(
        { ok: false, error: 'Valid formKey and open flag required' },
        { status: 400 }
      );
    }
    const ok = await setFormOpen(formKey, open, actorEmail);
    if (!ok) {
      return Response.json(
        { ok: false, error: 'Failed to save' },
        { status: 500 }
      );
    }
    // Public form pages are static, so refresh the one that shows the notice.
    revalidatePath(PUBLIC_FORMS.find((form) => form.key === formKey).path);
    return Response.json({ ok: true });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return Response.json(
      { ok: false, error: 'Valid email required' },
      { status: 400 }
    );
  }

  // Split the same way as registration-auth so both agree on the env lists.
  const envAdminEmails = (process.env.CLERK_ADMIN_EMAILS || '')
    .split(/[,\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const envReviewerEmails = (process.env.CLERK_REVIEWER_EMAILS || '')
    .split(/[,\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const normalised = email.toLowerCase().trim();

  if (action === 'add') {
    if (!role || !['admin', 'reviewer'].includes(role)) {
      return Response.json(
        { ok: false, error: 'Role must be admin or reviewer' },
        { status: 400 }
      );
    }
    try {
      await recordAdminAuditEvent(authResult.operator, {
        action: 'operator_email.granted',
        targetType: 'operator_email',
        targetId: normalised,
        details: { role },
      });
    } catch (error) {
      console.error(error);
      return Response.json(
        { ok: false, error: 'Failed to save' },
        { status: 500 }
      );
    }
    const ok = await addStoredEmail(normalised, role, actorEmail);
    return Response.json({ ok, error: ok ? undefined : 'Failed to save' });
  }

  if (action === 'remove') {
    if (
      envAdminEmails.includes(normalised) ||
      envReviewerEmails.includes(normalised)
    ) {
      return Response.json(
        {
          ok: false,
          error:
            'Env-var emails cannot be removed here — update CLERK_ADMIN_EMAILS or CLERK_REVIEWER_EMAILS in your environment.',
        },
        { status: 400 }
      );
    }
    try {
      await recordAdminAuditEvent(authResult.operator, {
        action: 'operator_email.removed',
        targetType: 'operator_email',
        targetId: normalised,
      });
    } catch (error) {
      console.error(error);
      return Response.json(
        { ok: false, error: 'Failed to remove' },
        { status: 500 }
      );
    }
    const ok = await removeStoredEmail(normalised);
    return Response.json({ ok, error: ok ? undefined : 'Failed to remove' });
  }

  return Response.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}
