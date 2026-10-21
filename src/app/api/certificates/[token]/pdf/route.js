import { createHash } from 'node:crypto';
import { protectPublicRoute } from '@/lib/api-security';
import {
  hasCertificateSession,
  resolveCertificateLink,
} from '@/lib/certificate-access';
import {
  recordCertificateDownload,
  recordCertificatePdfHash,
} from '@/lib/certificates-db';
import { renderCertificatePdf } from '@/lib/certificate-pdf';
import certificateUtils from '@/lib/certificate-utils.cjs';

const { certificateFileName } = certificateUtils;

export const runtime = 'nodejs';

const NO_STORE = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

// Downloads need an unexpired link, the emailed-code session, and a
// confirmed name. The PDF is identical on every download, so its
// fingerprint can be checked on the verification page.
export async function GET(request, context) {
  const protection = await protectPublicRoute(request, 'certificate-pdf', {
    windowMs: 10 * 60 * 1000,
    maxRequests: 30,
  });
  if (!protection.ok) return protection.response;

  const { token } = await context.params;
  try {
    const link = await resolveCertificateLink(token);
    if (link.state !== 'ok') {
      return Response.json(
        { error: 'Not found.' },
        { status: 404, headers: NO_STORE }
      );
    }
    if (!(await hasCertificateSession(link))) {
      return Response.json(
        { error: 'Please enter the code we emailed you first.' },
        { status: 401, headers: NO_STORE }
      );
    }
    const { certificate } = link;
    if (!certificate.nameConfirmedAt) {
      return Response.json(
        { error: 'Please confirm your name first.' },
        { status: 409, headers: NO_STORE }
      );
    }
    const pdf = await renderCertificatePdf({
      name: certificate.name,
      code: certificate.code,
      edition: certificate.edition,
      issuedAt: certificate.issuedAt,
      siteUrl: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL,
    });
    const sha256 = createHash('sha256').update(pdf).digest('hex');
    await Promise.all([
      sha256 !== certificate.pdfSha256 &&
        recordCertificatePdfHash(certificate.id, sha256),
      recordCertificateDownload(certificate),
    ]);
    return new Response(pdf, {
      headers: {
        ...NO_STORE,
        ...protection.headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${certificateFileName({ name: certificate.name, code: certificate.code })}"`,
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
