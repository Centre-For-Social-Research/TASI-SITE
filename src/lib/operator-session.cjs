function toOperatorSession(operator) {
  if (!operator?.authorized) {
    return null;
  }

  return {
    userId: operator.userId || "",
    primaryEmail: operator.primaryEmail || "",
    displayName: operator.displayName || "TASI Operator",
    role: operator.role || null,
    accessMode: operator.accessMode || "both",
  };
}

function buildOperatorLogContext(route, operator) {
  return {
    route,
    authOutcome: operator?.authorized ? "authorized" : operator?.reason || "unknown",
    role: operator?.role || null,
    userId: operator?.userId || null,
    primaryEmail: operator?.primaryEmail || null,
    accessMode: operator?.accessMode || null,
    sessionUserIdPresent: Boolean(operator?.sessionUserIdPresent),
    currentUserResolved: Boolean(operator?.currentUserResolved),
    publishableKeyConfigured: Boolean(operator?.clerkConfig?.publishableKeyConfigured),
    secretKeyConfigured: Boolean(operator?.clerkConfig?.secretKeyConfigured),
    allowlistSource: operator?.allowlistSource || null,
  };
}

function logOperatorEvent(event, route, operator, extra = {}) {
  console.info(
    `[operator-auth] ${JSON.stringify({
      event,
      ...buildOperatorLogContext(route, operator),
      ...extra,
    })}`
  );
}

module.exports = {
  toOperatorSession,
  buildOperatorLogContext,
  logOperatorEvent,
};
