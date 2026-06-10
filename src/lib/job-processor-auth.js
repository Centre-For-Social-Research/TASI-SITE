import { timingSafeEqual } from 'node:crypto';
import { requireAdminOperator } from '@/lib/registration-auth';

function secretsMatch(provided, configured) {
  const providedBuf = Buffer.from(provided);
  const configuredBuf = Buffer.from(configured);
  if (providedBuf.length !== configuredBuf.length) {
    return false;
  }
  return timingSafeEqual(providedBuf, configuredBuf);
}

function buildSystemProcessorOperator() {
  return {
    authorized: true,
    userId: 'system-job-processor',
    primaryEmail: 'system-job-processor@local',
    displayName: 'System Job Processor',
  };
}

export async function authorizeJobProcessorRequest(request, context = {}) {
  const configuredSecret =
    process.env.REGISTRATION_JOB_PROCESSOR_SECRET?.trim();
  const providedSecret =
    request.headers.get('x-registration-job-secret') ||
    request.headers.get('x-job-processor-secret') ||
    '';

  if (configuredSecret && secretsMatch(providedSecret, configuredSecret)) {
    return {
      ok: true,
      operator: buildSystemProcessorOperator(),
      internal: true,
    };
  }

  return requireAdminOperator(context);
}
