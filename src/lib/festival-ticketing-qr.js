import crypto from "node:crypto";

function getQrSecret() {
  const secret = process.env.QR_HMAC_SECRET?.trim();
  if (!secret) {
    throw new Error("QR_HMAC_SECRET is not configured.");
  }
  return secret;
}

function signTicketId(ticketId) {
  return crypto
    .createHmac("sha256", getQrSecret())
    .update(String(ticketId))
    .digest("hex");
}

export function buildFestivalQrPayload(ticketId) {
  return `TASI2026:${ticketId}:${signTicketId(ticketId)}`;
}

export function verifyFestivalQrPayload(payload) {
  const [prefix, ticketId, signature] = String(payload || "").split(":");
  if (!prefix || !ticketId || !signature || prefix !== "TASI2026") {
    return null;
  }

  const expected = signTicketId(ticketId);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ? ticketId
    : null;
}
