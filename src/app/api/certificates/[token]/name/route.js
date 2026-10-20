import { protectPublicPostRoute } from '@/lib/api-security';
import {
  LINK_STATE_MESSAGES,
  hasCertificateSession,
  resolveCertificateLink,
} from '@/lib/certificate-access';
import {
  changeCertificateNameByToken,
  confirmCertificateNameByToken,
} from '@/lib/certificates-db';
import certificateUtils from '@/lib/certificate-utils.cjs';

const { MAX_NAME_CHANGES } = certificateUtils;

// Edits the name (before it is confirmed) or confirms and locks it. Both
// need the session opened with the emailed code.
export async function POST(request, context) {
  const protection = await protectPublicPostRoute(request, 'certificate-name', {
    windowMs: 10 * 60 * 1000,
    maxRequests: 10,
  });
  if (!protection.ok) return protection.response;

  const { token } = await context.params;
  let body = {};
  try {
    body = (await request.json()) || {};
  } catch {
    body = {};
  }
  try {
    const link = await resolveCertificateLink(token);
    if (link.state !== 'ok') {
      return Response.json(
        { error: LINK_STATE_MESSAGES[link.state] },
        { status: 404, headers: protection.headers }
      );
    }
    if (!(await hasCertificateSession(link))) {
      return Response.json(
        { error: 'Please enter the code we emailed you first.' },
        { status: 401, headers: protection.headers }
      );
    }
    const certificate =
      body.action === 'confirm'
        ? await confirmCertificateNameByToken(token)
        : await changeCertificateNameByToken({ token, name: body.name });
    return Response.json(
      {
        ok: true,
        name: certificate.name,
        confirmed: Boolean(certificate.nameConfirmedAt),
        changesLeft: Math.max(
          0,
          MAX_NAME_CHANGES - certificate.nameChangeCount
        ),
      },
      { headers: protection.headers }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update the name.';
    return Response.json(
      { error: message },
      {
        status: /not found/i.test(message) ? 404 : 400,
        headers: protection.headers,
      }
    );
  }
}
