import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson, ADMIN_NO_STORE_HEADERS } from '@/lib/admin-api-cache';
import { getCertificateById } from '@/lib/certificates-db';
import { renderCertificatePdf } from '@/lib/certificate-pdf';

export const runtime = 'nodejs';

// Organisers see the certificate marked SAMPLE, so an admin copy can never
// pass for the attendee's own download.
export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.certificates.pdf',
  });
  if (!authResult.ok) return authResult.response;
  try {
    const { id } = await context.params;
    const certificate = await getCertificateById(id);
    const pdf = await renderCertificatePdf({
      name: certificate.name,
      code: certificate.code,
      edition: certificate.edition,
      issuedAt: certificate.issuedAt,
      siteUrl: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL,
      sample: true,
    });
    return new Response(pdf, {
      headers: {
        ...ADMIN_NO_STORE_HEADERS,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="certificate-sample.pdf"',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to render certificate.';
    return adminJson(
      { error: message },
      { status: /not found/i.test(message) ? 404 : 500 }
    );
  }
}
