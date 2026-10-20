import { protectPublicPostRoute } from '@/lib/api-security';
import {
  LINK_STATE_MESSAGES,
  resolveCertificateLink,
  startCertificateSession,
} from '@/lib/certificate-access';
import { verifyCertificateEmailCode } from '@/lib/certificates-db';

// Checks the emailed code and, if right, opens a two-hour session for this
// certificate in this browser.
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
    return Response.json({ ok: true }, { headers: protection.headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to check the code.';
    return Response.json(
      { error: message },
      { status: 400, headers: protection.headers }
    );
  }
}
