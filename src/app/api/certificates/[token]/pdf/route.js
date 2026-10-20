import { protectPublicRoute } from '@/lib/api-security';
import {
  getCertificateByToken,
  recordCertificateDownload,
} from '@/lib/certificates-db';
import { renderCertificatePdf } from '@/lib/certificate-pdf';
import certificateUtils from '@/lib/certificate-utils.cjs';

const { certificateFileName, isValidClaimToken } = certificateUtils;

export const runtime = 'nodejs';

const NO_STORE = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

export async function GET(request, context) {
  const protection = await protectPublicRoute(request, 'certificate-pdf', {
    windowMs: 10 * 60 * 1000,
    maxRequests: 30,
  });
  if (!protection.ok) return protection.response;

  const { token } = await context.params;
  // Validate the token's shape before touching the database.
  if (!isValidClaimToken(token)) {
    return Response.json(
      { error: 'Not found.' },
      { status: 404, headers: NO_STORE }
    );
  }
  try {
    const certificate = await getCertificateByToken(token);
    if (!certificate || certificate.status !== 'active') {
      return Response.json(
        { error: 'Not found.' },
        { status: 404, headers: NO_STORE }
      );
    }
    const pdf = await renderCertificatePdf({
      name: certificate.name,
      code: certificate.code,
      edition: certificate.edition,
      issuedAt: certificate.issuedAt,
      siteUrl: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL,
    });
    await recordCertificateDownload(certificate);
    const inline = new URL(request.url).searchParams.get('view') === '1';
    return new Response(pdf, {
      headers: {
        ...NO_STORE,
        ...protection.headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${certificateFileName({ name: certificate.name, code: certificate.code })}"`,
      },
    });
  } catch (error) {
    console.error('Certificate download failed.', error);
    return Response.json(
      {
        error:
          'We could not prepare your certificate. Please try again in a few minutes.',
      },
      { status: 503, headers: NO_STORE }
    );
  }
}
