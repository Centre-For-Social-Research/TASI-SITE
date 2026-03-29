const DEFAULT_JOB_CHUNK_SIZE = 20;
const MAX_JOB_RETRIES = 3;

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizeFilters(filters = {}) {
  return {
    search: normalizeString(filters.search),
    status: "confirmed",
    category: normalizeString(filters.category),
    priorityTier: normalizeString(filters.priorityTier),
    country: normalizeString(filters.country),
    organization: normalizeString(filters.organization),
    speakerFlag: normalizeString(filters.speakerFlag),
    lateConfirmation: normalizeString(filters.lateConfirmation),
  };
}

function uniqueValues(values = []) {
  return [...new Set(values.map(normalizeString).filter(Boolean))];
}

function buildJobSelection({
  filters = {},
  registrationIds = [],
  resendExisting = false,
} = {}) {
  const normalizedIds = uniqueValues(registrationIds);

  return {
    filters: normalizeFilters(filters),
    selectionMode: normalizedIds.length ? "selected" : "filtered",
    registrationIds: normalizedIds,
    resendExisting: Boolean(resendExisting),
  };
}

function shouldSkipJobItem({ resendExisting = false, registration } = {}) {
  return !resendExisting && Boolean(registration?.qr_pass_issued_at);
}

function deriveJobProgress({ status = "queued", totals = {} } = {}) {
  const total = Number(totals.total || 0);
  const queued = Number(totals.queued || 0);
  const processing = Number(totals.processing || 0);
  const sent = Number(totals.sent || 0);
  const failed = Number(totals.failed || 0);
  const retrying = Number(totals.retrying || 0);
  const completed = sent + failed + retrying;
  const remaining = Math.max(total - completed, 0);
  const percentComplete = total ? Math.round((completed / total) * 100) : 0;

  let tone = "default";
  if (queued > 0 || processing > 0 || retrying > 0) {
    tone = "warning";
  } else if (status === "failed" || failed > 0) {
    tone = "danger";
  } else if (status === "completed" || (total > 0 && sent === total)) {
    tone = "success";
  }

  return {
    total,
    queued,
    processing,
    sent,
    failed,
    retrying,
    completed,
    remaining,
    percentComplete,
    tone,
  };
}

function isQueueInfrastructureUnavailable(errorOrMessage) {
  const message =
    errorOrMessage instanceof Error
      ? errorOrMessage.message
      : String(errorOrMessage || "");

  return (
    message.includes("pass_issue_email_jobs") ||
    message.includes("pass_issue_email_job_items") ||
    message.includes("schema cache")
  );
}

module.exports = {
  DEFAULT_JOB_CHUNK_SIZE,
  MAX_JOB_RETRIES,
  buildJobSelection,
  deriveJobProgress,
  isQueueInfrastructureUnavailable,
  shouldSkipJobItem,
};
