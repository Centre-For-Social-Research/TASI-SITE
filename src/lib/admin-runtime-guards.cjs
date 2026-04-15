const ADMIN_NOTIFICATION_READ_KEY = 'tasi-admin-read-notifications';

function sanitizeIdentitySegment(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildAdminNotificationStorageKey(operator = {}) {
  const userId = String(operator.userId || '').trim();
  const emailSegment = sanitizeIdentitySegment(operator.primaryEmail);
  const identity = userId || emailSegment || 'anonymous';
  return `${ADMIN_NOTIFICATION_READ_KEY}:${identity}`;
}

function getRuntimeIssueFromStatuses(statuses = [], currentPath = '/admin') {
  if (statuses.includes(403)) {
    return {
      kind: 'forbidden',
      redirectTo: '/not-authorized',
    };
  }

  if (statuses.includes(401) || statuses.includes(503)) {
    return {
      kind: 'reauth',
      redirectTo: `/sign-in?redirect_url=${encodeURIComponent(currentPath)}`,
    };
  }

  return null;
}

function resolveSummary(previousState, registrations = {}) {
  if (registrations.ok) {
    return (
      registrations.data?.summary || {
        pending: 0,
        confirmed: 0,
        qrIssued: 0,
        checkedIn: 0,
      }
    );
  }

  return previousState.summary;
}

function resolveJobs(previousState, jobs = {}) {
  if (jobs.ok) {
    return jobs.data?.jobs || [];
  }

  return previousState.jobs;
}

function resolveAdminShellRuntimeState({
  currentPath = '/admin',
  previousState = {
    summary: { pending: 0, confirmed: 0, qrIssued: 0, checkedIn: 0 },
    jobs: [],
  },
  registrations = {},
  jobs = {},
} = {}) {
  const authIssue = getRuntimeIssueFromStatuses(
    [registrations.status, jobs.status].filter(Boolean),
    currentPath
  );

  if (authIssue) {
    return {
      nextState: previousState,
      runtimeIssue: authIssue,
    };
  }

  const nextState = {
    summary: resolveSummary(previousState, registrations),
    jobs: resolveJobs(previousState, jobs),
  };

  const degraded =
    (!registrations.ok && registrations.status) || (!jobs.ok && jobs.status);

  return {
    nextState,
    runtimeIssue: degraded
      ? {
          kind: 'degraded',
          message: 'Live admin stats are temporarily unavailable.',
        }
      : null,
  };
}

module.exports = {
  buildAdminNotificationStorageKey,
  resolveAdminShellRuntimeState,
};
