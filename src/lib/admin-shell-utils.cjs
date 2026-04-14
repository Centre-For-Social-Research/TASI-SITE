function toNumber(value) {
  const normalized = Number(value || 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

function buildAdminStatPills({ summary = {}, jobs = [] } = {}) {
  const pending = toNumber(summary.pending);
  const confirmed = toNumber(summary.confirmed);
  const qrIssued = toNumber(summary.qrIssued);
  const checkedIn = toNumber(summary.checkedIn);
  const failed = jobs.reduce(
    (total, job) => total + toNumber(job?.failed_items),
    0
  );

  return [
    { key: 'pending', label: 'Pending', value: pending, tone: 'warning' },
    {
      key: 'qrQueue',
      label: 'QR Queue',
      value: Math.max(confirmed - qrIssued, 0),
      tone: 'accent',
    },
    {
      key: 'checkedIn',
      label: 'Checked In',
      value: checkedIn,
      tone: 'success',
    },
    { key: 'failed', label: 'Failed', value: failed, tone: 'danger' },
  ];
}

function buildAdminNavigation({ pathname = '', summary = {}, jobs = [] } = {}) {
  const normalizedPath = String(pathname || '');
  const failed = jobs.reduce(
    (total, job) => total + toNumber(job?.failed_items),
    0
  );

  return [
    {
      key: 'operations',
      label: 'Operations',
      items: [
        {
          href: '/admin/registrations',
          label: 'Review Queue',
          active:
            normalizedPath === '/admin/registrations' ||
            normalizedPath === '/admin',
          badgeCount: toNumber(summary.pending),
          badgeTone: 'warning',
          showBadge: toNumber(summary.pending) > 0,
        },
        {
          href: '/admin/delivery',
          label: 'Delivery',
          active: normalizedPath === '/admin/delivery',
          badgeCount: failed,
          badgeTone: 'danger',
          showBadge: failed > 0,
        },
        {
          href: '/admin/check-in',
          label: 'Check-In',
          active: normalizedPath === '/admin/check-in',
          badgeCount: 0,
          badgeTone: 'default',
          showBadge: false,
        },
        {
          href: '/admin/tickets',
          label: 'Tickets',
          active: normalizedPath === '/admin/tickets',
          badgeCount: 0,
          badgeTone: 'accent',
          showBadge: false,
        },
      ],
    },
  ];
}

function buildAdminNotifications({ summary = {}, jobs = [] } = {}) {
  const pending = toNumber(summary.pending);
  const confirmed = toNumber(summary.confirmed);
  const qrIssued = toNumber(summary.qrIssued);
  const checkedIn = toNumber(summary.checkedIn);
  const failed = jobs.reduce(
    (total, job) => total + toNumber(job?.failed_items),
    0
  );
  const qrQueue = Math.max(confirmed - qrIssued, 0);

  return [
    {
      key: 'pending',
      title: 'Review queue needs attention',
      detail: `${pending} registrations are still pending an operator decision.`,
      tone: 'warning',
    },
    {
      key: 'qrQueue',
      title: 'QR delivery backlog',
      detail: `${qrQueue} confirmed attendees are still waiting for QR issuance.`,
      tone: 'accent',
    },
    {
      key: 'failed',
      title: 'Delivery failures detected',
      detail: `${failed} QR delivery attempts need retry or manual review.`,
      tone: 'danger',
    },
    {
      key: 'checkin',
      title: 'On-site progress',
      detail: `${checkedIn} attendees have already checked in.`,
      tone: 'success',
    },
  ];
}

function buildAdminNotificationId(notification = {}) {
  return `${notification.key || 'notification'}:${notification.detail || ''}`;
}

function filterUnreadAdminNotifications(notifications = [], readIds = new Set()) {
  return notifications.filter(
    (notification) => !readIds.has(buildAdminNotificationId(notification))
  );
}

module.exports = {
  buildAdminNavigation,
  buildAdminNotificationId,
  buildAdminNotifications,
  buildAdminStatPills,
  filterUnreadAdminNotifications,
};
