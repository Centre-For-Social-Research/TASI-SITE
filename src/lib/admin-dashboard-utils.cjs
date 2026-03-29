function isSupabaseAdminConfigError(message) {
  const value = String(message || "");

  return (
    value.includes("Missing SUPABASE_URL") ||
    value.includes("Missing SUPABASE_SERVICE_ROLE_KEY")
  );
}

function getBatchStatusTone(message) {
  if (!message) {
    return "default";
  }

  if (/queued|processing|retrying|in progress/i.test(message)) {
    return "warning";
  }

  if (isSupabaseAdminConfigError(message) || /unable|error|failed/i.test(message)) {
    return "danger";
  }

  if (/processed|sent|issued|saved|success/i.test(message)) {
    return "success";
  }

  return "default";
}

function buildDashboardQueryString(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, rawValue]) => {
    const value = String(rawValue || "").trim();
    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
}

function summarizeSelection({ selectedCount = 0, matchedCount = 0 } = {}) {
  const normalizedSelected = Number(selectedCount || 0);
  const normalizedMatched = Number(matchedCount || 0);

  return {
    selectedLabel: `${normalizedSelected} selected`,
    matchedLabel: `${normalizedMatched} matched`,
    actionScopeLabel:
      normalizedSelected > 0 ? "Send to selected attendees" : "Send to all matched attendees",
  };
}

module.exports = {
  buildDashboardQueryString,
  summarizeSelection,
  isSupabaseAdminConfigError,
  getBatchStatusTone,
};
