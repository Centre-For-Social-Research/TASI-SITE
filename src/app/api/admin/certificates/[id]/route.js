import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  getCertificateDetail,
  updateCertificateByAdmin,
} from '@/lib/certificates-db';

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.certificates.detail',
  });
  if (!authResult.ok) return authResult.response;
  try {
    const { id } = await context.params;
    return adminJson({ success: true, ...(await getCertificateDetail(id)) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load certificate.';
    return adminJson(
      { error: message },
      { status: /not found/i.test(message) ? 404 : 500 }
    );
  }
}

export async function PATCH(request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.certificates.update',
  });
  if (!authResult.ok) return authResult.response;
  try {
    const [{ id }, body] = await Promise.all([context.params, request.json()]);
    const certificate = await updateCertificateByAdmin({
      id,
      name: body.name,
      email: body.email,
      operator: authResult.operator,
    });
    return adminJson({ success: true, certificate });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update certificate.';
    return adminJson(
      { error: message },
      { status: /not found/i.test(message) ? 404 : 400 }
    );
  }
}
