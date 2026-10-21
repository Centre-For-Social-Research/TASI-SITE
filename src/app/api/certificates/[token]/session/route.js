import { protectPublicPostRoute } from '@/lib/api-security';
import {
  LINK_STATE_MESSAGES,
  resolveCertificateLink,
  startCertificateSession,
} from '@/lib/certificate-access';
import { verifyCertificateEmailCode } from '@/lib/certificates-db';
import certificateUtils from '@/lib/certificate-utils.cjs';

const { MAX_NAME_CHANGES } = certificateUtils;

// Checks the emailed code and, if right, opens a two-hour session for this
// certificate in this browser. The reply carries the name state, so a
// certificate whose name is already locked goes straight to download.
export async function POST(request, context) {
  const protection = await protectPublicPostRoute(
    request,
    'certificate-session',
    {
      windowMs: 15 * 60 * 1000,
      maxRequests: 15,
    }
  );
  if (!protection.ok) return protection.response;

  const { token } = await context.params;
  let code = '';
  try {
    code = (await request.json())?.code;
  } catch {
    code = '';
  }
  try {
    const link = await resolveCertificateLink(token);
    if (link.state !== 'ok') {
      return Response.json(
        { error: LINK_STATE_MESSAGES[link.state] },
        { status: 404, headers: protection.headers }
      );
    }
    await verifyCertificateEmailCode({
      certificateId: link.certificate.id,
      code,
    });
    await startCertificateSession(link);
    const { certificate } = link;
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
      error instanceof Error ? error.message : 'Unable to check the code.';
    return Response.json(
      { error: message },
      { status: 400, headers: protection.headers }
    );
  }
}
