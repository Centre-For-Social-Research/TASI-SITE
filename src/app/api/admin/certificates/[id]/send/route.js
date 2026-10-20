import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { sendCertificateEmail } from '@/lib/certificates-send';

export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.certificates.send',
  });
  if (!authResult.ok) return authResult.response;
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const certificate = await sendCertificateEmail({
      id,
      operator: authResult.operator,
      resend: body?.resend === true,
      reminder: body?.reminder === true,
    });
    return adminJson({ success: true, certificate });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send certificate.';
    return adminJson(
      { error: message },
      {
        status: /already|revoked|reminder|downloaded|first/i.test(message)
          ? 409
          : 502,
      }
    );
  }
}
