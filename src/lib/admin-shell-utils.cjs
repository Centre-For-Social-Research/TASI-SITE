function toNumber(value) {
  const normalized = Number(value || 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

function buildAdminStatPills({ summary = {}, jobs = [] } = {}) {
  const pending = toNumber(summary.pending);
  const confirmed = toNumber(summary.confirmed);
  const qrIssued = toNumber(summary.qrIssued);
  const checkedIn = toNumber(summary.checkedIn);
  const failed = jobs.reduce((total, job) => total + toNumber(job?.failed_items), 0);

  return [
    { key: "pending", label: "Pending", value: pending, tone: "warning" },
    { key: "qrQueue", label: "QR Queue", value: Math.max(confirmed - qrIssued, 0), tone: "accent" },
    { key: "checkedIn", label: "Checked In", value: checkedIn, tone: "success" },
    { key: "failed", label: "Failed", value: failed, tone: "danger" },
  ];
}

function buildAdminNavigation({ pathname = "", summary = {}, jobs = [] } = {}) {
  const normalizedPath = String(pathname || "");
  const failed = jobs.reduce((total, job) => total + toNumber(job?.failed_items), 0);

  return [
    {
      key: "operations",
      label: "Operations",
      items: [
        {
          href: "/admin/registrations",
          label: "Review Queue",
          active: normalizedPath === "/admin/registrations" || normalizedPath === "/admin",
          badgeCount: toNumber(summary.pending),
          badgeTone: "warning",
          showBadge: toNumber(summary.pending) > 0,
        },
        {
          href: "/admin/delivery",
          label: "Delivery",
          active: normalizedPath === "/admin/delivery",
          badgeCount: failed,
          badgeTone: "danger",
          showBadge: failed > 0,
        },
        {
          href: "/admin/check-in",
          label: "Check-In",
          active: normalizedPath === "/admin/check-in",
          badgeCount: 0,
          badgeTone: "default",
          showBadge: false,
        },
      ],
    },
  ];
}

module.exports = {
  buildAdminNavigation,
  buildAdminStatPills,
};
