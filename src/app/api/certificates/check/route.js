import { protectPublicPostRoute } from '@/lib/api-security';
import { findCertificateByPdfHash } from '@/lib/certificates-db';

// Checks a certificate file against the fingerprints of issued PDFs. The
// browser hashes the file itself; only the SHA-256 is sent, never the file.
export async function POST(request) {
  const protection = await protectPublicPostRoute(
    request,
    'certificate-check',
    {
      windowMs: 10 * 60 * 1000,
      maxRequests: 30,
    }
  );
  if (!protection.ok) return protection.response;

  let sha256 = '';
  try {
    sha256 = String((await request.json())?.sha256 || '').toLowerCase();
  } catch {
    sha256 = '';
  }
  if (!/^[a-f0-9]{64}$/.test(sha256)) {
    return Response.json(
      { error: 'Invalid file fingerprint.' },
      { status: 400, headers: protection.headers }
    );
  }
  try {
    const match = await findCertificateByPdfHash(sha256);
    return Response.json(
      match
        ? {
            match: true,
            code: match.code,
            name: match.name,
            active: match.status === 'active',
          }
        : { match: false },
      { headers: protection.headers }
    );
  } catch (error) {
    console.error('Certificate file check failed.', error);
    return Response.json(
      { error: 'Unable to check the file right now.' },
      { status: 503, headers: protection.headers }
    );
  }
}
