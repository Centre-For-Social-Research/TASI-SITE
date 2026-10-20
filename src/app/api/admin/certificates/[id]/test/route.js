import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendCertificateTest } from '@/lib/certificates-send';

export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.certificates.test',
  });
  if (!authResult.ok) return authResult.response;
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const to =
      typeof body?.to === 'string' && body.to.trim()
        ? body.to
        : authResult.operator?.primaryEmail;
    return adminJson({
      success: true,
      ...(await sendCertificateTest({ id, to })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send test email.';
    return adminJson(
      { error: message },
      { status: /required/i.test(message) ? 400 : 502 }
    );
  }
}
