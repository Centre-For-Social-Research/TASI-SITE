import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  countEligibleWithoutCertificate,
  issueEligibleCertificates,
  issueManualCertificate,
  listCertificates,
} from '@/lib/certificates-db';

function errorStatus(message) {
  if (/not found/i.test(message)) return 404;
  if (
    /required|valid|already|speaker|letters|characters|configured/i.test(
      message
    )
  )
    return 400;
  return 500;
}

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.certificates.list',
  });
  if (!authResult.ok) return authResult.response;
  try {
    const edition = new URL(request.url).searchParams.get('edition') || '2026';
    const [certificates, pendingEligible] = await Promise.all([
      listCertificates({ edition }),
      countEligibleWithoutCertificate({ edition }),
    ]);
    const summary = {
      total: certificates.length,
      active: certificates.filter((c) => c.status === 'active').length,
      revoked: certificates.filter((c) => c.status === 'revoked').length,
      emailed: certificates.filter((c) => c.emailStatus === 'sent').length,
      notEmailed: certificates.filter(
        (c) => c.status === 'active' && c.emailStatus === 'draft'
      ).length,
      failed: certificates.filter((c) => c.emailStatus === 'failed').length,
      downloaded: certificates.filter((c) => c.downloadCount > 0).length,
      pendingEligible,
    };
    return adminJson({ success: true, certificates, summary });
  } catch (error) {
    console.error('Unable to list certificates.', error);
    return adminJson(
      { error: 'Unable to load certificates.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.certificates.issue',
  });
  if (!authResult.ok) return authResult.response;
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action === 'issue-eligible') {
      const result = await issueEligibleCertificates({
        edition: body.edition,
        operator: authResult.operator,
      });
      return adminJson({ success: true, ...result });
    }
    if (body.action === 'add') {
      const certificate = await issueManualCertificate({
        edition: body.edition,
        name: body.name,
        email: body.email,
        operator: authResult.operator,
      });
      return adminJson({ success: true, certificate }, { status: 201 });
    }
    return adminJson({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to issue certificates.';
    return adminJson({ error: message }, { status: errorStatus(message) });
  }
}
