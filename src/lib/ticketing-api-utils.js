function includesAny(value, patterns) {
  return patterns.some((pattern) => value.includes(pattern));
}

export function isSupabaseAdminConfigError(message) {
  const value = String(message || "");

  return includesAny(value, [
    "Missing SUPABASE_URL",
    "Missing SUPABASE_SERVICE_ROLE_KEY",
  ]);
}

export function isMissingTicketingSchemaError(message) {
  const value = String(message || "");

  return (
    value.includes("ticket_events") &&
    includesAny(value.toLowerCase(), [
      "schema cache",
      "relation",
      "does not exist",
    ])
  );
}

export function shouldServeDemoTicketEvents({ message, nodeEnv }) {
  if (isSupabaseAdminConfigError(message)) {
    return true;
  }

  return nodeEnv !== "production" && isMissingTicketingSchemaError(message);
}
