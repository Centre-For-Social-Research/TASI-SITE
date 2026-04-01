import crypto from "node:crypto";
import {
  sanitizeEmail,
  sanitizePhone,
  sanitizeShortText,
} from "@/lib/input-sanitizers";

export function normalizeTicketEmail(value) {
  return sanitizeEmail(value);
}

export function normalizeTicketPhone(value) {
  return sanitizePhone(value);
}

export function normalizeTicketName(value, fieldName = "Name") {
  return sanitizeShortText(value, {
    maxLength: 120,
    fieldName,
    required: true,
  });
}

export function buildTicketOrderCode() {
  return `TASI26-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function buildTicketCode() {
  return `TKT-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

export function buildTicketQrToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function buildOrderIdempotencyKey({
  eventId,
  buyerEmail,
  buyerPhone,
  ticketSelections,
}) {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        eventId,
        buyerEmail: normalizeTicketEmail(buyerEmail),
        buyerPhone: normalizeTicketPhone(buyerPhone),
        ticketSelections,
      }),
    )
    .digest("hex");
}

export function buildTicketQrPayload(ticket) {
  return JSON.stringify({
    type: "tasi-2026-ticket",
    ticketCode: ticket.ticket_code,
    qrToken: ticket.qr_token,
    eventId: ticket.event_id,
  });
}

export function buildWebhookDedupeKey(provider, payload) {
  return crypto
    .createHash("sha256")
    .update(
      `${provider}:${
        typeof payload === "string" ? payload : JSON.stringify(payload)
      }`,
    )
    .digest("hex");
}
