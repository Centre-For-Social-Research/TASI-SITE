function normalizeInteger(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : 0;
}

function isActiveHold(hold, nowMs) {
  const expiresAt = Date.parse(hold?.expires_at || '');
  return Number.isFinite(expiresAt) && expiresAt > nowMs;
}

export function summarizeTicketAvailability({
  capacity,
  soldQuantity = 0,
  holds = [],
  now = new Date(),
} = {}) {
  const normalizedCapacity = normalizeInteger(capacity);
  const normalizedSoldQuantity = normalizeInteger(soldQuantity);
  const nowMs =
    typeof now === 'string' || now instanceof Date
      ? new Date(now).getTime()
      : Date.now();

  let activeHeldQuantity = 0;
  let expiredHeldQuantity = 0;

  for (const hold of holds) {
    const quantity = normalizeInteger(hold?.quantity);
    if (isActiveHold(hold, nowMs)) {
      activeHeldQuantity += quantity;
    } else {
      expiredHeldQuantity += quantity;
    }
  }

  const availableQuantity = Math.max(
    normalizedCapacity - normalizedSoldQuantity - activeHeldQuantity,
    0
  );

  return {
    capacity: normalizedCapacity,
    soldQuantity: normalizedSoldQuantity,
    activeHeldQuantity,
    expiredHeldQuantity,
    availableQuantity,
    isSoldOut: availableQuantity <= 0,
  };
}
