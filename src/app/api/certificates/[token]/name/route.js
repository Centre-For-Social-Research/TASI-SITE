import { protectPublicPostRoute } from '@/lib/api-security';
import { changeCertificateNameByToken } from '@/lib/certificates-db';
import certificateUtils from '@/lib/certificate-utils.cjs';

const { MAX_NAME_CHANGES, isValidClaimToken } = certificateUtils;

export async function POST(request, context) {
  const protection = await protectPublicPostRoute(request, 'certificate-name', {
    windowMs: 10 * 60 * 1000,
    maxRequests: 10,
  });
  if (!protection.ok) return protection.response;

  const { token } = await context.params;
  if (!isValidClaimToken(token)) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }
  let name = '';
  try {
    name = (await request.json())?.name;
  } catch {
    name = '';
  }
  try {
    const certificate = await changeCertificateNameByToken({ token, name });
    return Response.json(
      {
        ok: true,
        name: certificate.name,
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
    const status = /not found/i.test(message) ? 404 : 400;
    return Response.json(
      { error: message },
      { status, headers: protection.headers }
    );
  }
}
