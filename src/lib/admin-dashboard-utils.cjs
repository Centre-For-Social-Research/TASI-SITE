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

  if (isSupabaseAdminConfigError(message) || /unable|error|failed/i.test(message)) {
    return "danger";
  }

  if (/processed|sent|issued|saved|success/i.test(message)) {
    return "success";
  }

  return "default";
}

module.exports = {
  isSupabaseAdminConfigError,
  getBatchStatusTone,
};
