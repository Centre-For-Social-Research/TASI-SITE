import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { previewCertificateEmail } from '@/lib/certificates-send';

export async function GET(request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.certificates.preview',
  });
  if (!authResult.ok) return authResult.response;
  try {
    const { id } = await context.params;
    return adminJson({
      success: true,
      email: await previewCertificateEmail(id, {
        reminder: new URL(request.url).searchParams.get('reminder') === '1',
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to preview email.';
    return adminJson(
      { error: message },
      { status: /not found/i.test(message) ? 404 : 500 }
    );
  }
}
