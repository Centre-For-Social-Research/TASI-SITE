import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { setCertificateRevoked } from '@/lib/certificates-db';

export async function POST(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.certificates.revoke',
  });
  if (!authResult.ok) return authResult.response;
  try {
    const [{ id }, body] = await Promise.all([
      context.params,
      request.json().catch(() => ({})),
    ]);
    const certificate = await setCertificateRevoked({
      id,
      revoked: body?.revoked !== false,
      reason: body?.reason,
      operator: authResult.operator,
    });
    return adminJson({ success: true, certificate });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update certificate.';
    return adminJson(
      { error: message },
      { status: /not found/i.test(message) ? 404 : 500 }
    );
  }
}
