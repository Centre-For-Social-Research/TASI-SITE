import { FESTIVAL_EVENT_COPY } from "./festival-ticketing-constants.js";
import QRCode from "qrcode";

function getInvoiceDate(createdAt) {
  const date = createdAt ? new Date(createdAt) : new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildInvoiceNumber(prefix, createdAt, sourceId) {
  const year = new Date(createdAt || Date.now()).getUTCFullYear();
  const suffix =
    String(sourceId || "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-6)
      .toUpperCase() || "000001";
  return `INV-${prefix}-${year}-${suffix}`;
}

export function buildFestivalInvoiceMetadata({ ticket, user }) {
  const domestic = ticket.ticket_type === "domestic";
  const invoiceDate = getInvoiceDate(ticket.created_at);

  return {
    invoiceNumber: buildInvoiceNumber(
      domestic ? "DOM" : "INT",
      ticket.created_at,
      ticket.id,
    ),
    invoiceDate,
    currency: ticket.currency,
    taxLabel: domestic ? "GST" : "Zero-rated export",
    taxAmountMinor: Number(ticket.tax_amount_minor || 0),
    totalAmountMinor: Number(ticket.total_amount_minor || 0),
    baseAmountMinor: Number(ticket.base_amount_minor || 0),
    attendeeName: user.full_name,
    attendeeEmail: user.email,
    country: user.country,
    billingName: user.billing_name || user.full_name,
    billingEmail: user.billing_email || user.email,
    billingPhone: user.billing_phone || user.phone || "",
    billingAddressLine1: user.billing_address_line1 || "",
    billingAddressLine2: user.billing_address_line2 || "",
    billingCity: user.billing_city || "",
    billingStateOrProvince: user.billing_state_or_province || "",
    billingPostalCode: user.billing_postal_code || "",
    billingCountry: user.billing_country || user.country,
    taxIdNumber: user.tax_id_number || "",
    gstin: user.gstin || "",
    passportOrNationalId: user.passport_or_national_id || "",
    description: `${FESTIVAL_EVENT_COPY.title} - ${FESTIVAL_EVENT_COPY.description}`,
  };
}

async function createPdfWithQr({ title, subtitleLines = [], qrPayload, footerLines = [] }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  doc.setFillColor(20, 15, 38);
  doc.rect(0, 0, 595, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(title, 40, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = 130;
  doc.setTextColor(20, 15, 38);

  subtitleLines.forEach((line) => {
    doc.text(line, 40, y);
    y += 18;
  });

  if (qrPayload) {
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 220,
      color: { dark: "#140f26", light: "#FFFFFF" },
    });
    doc.addImage(qrDataUrl, "PNG", 360, 120, 160, 160);
  }

  doc.setFontSize(10);
  footerLines.forEach((line, index) => {
    doc.text(line, 40, 760 + index * 14);
  });

  return Buffer.from(doc.output("arraybuffer"));
}

export async function buildFestivalTicketPdf({ ticket, user }) {
  return createPdfWithQr({
    title: "TASI 2026 Festival Ticket",
    subtitleLines: [
      `Ticket Number: ${ticket.ticket_number}`,
      `Attendee: ${user.full_name}`,
      `Organization: ${user.organization || "Independent attendee"}`,
      `Ticket Type: ${ticket.ticket_type}`,
      `Event: ${FESTIVAL_EVENT_COPY.title}`,
      `Dates: ${FESTIVAL_EVENT_COPY.datesLabel}`,
    ],
    qrPayload: ticket.qr_payload,
    footerLines: [FESTIVAL_EVENT_COPY.venue, FESTIVAL_EVENT_COPY.description],
  });
}

export async function buildFestivalBadgePdf({ ticket, user }) {
  return createPdfWithQr({
    title: user.full_name,
    subtitleLines: [
      user.organization || "Festival Attendee",
      `Badge Number: ${ticket.badge_number || ticket.ticket_number}`,
      `Pass Type: ${ticket.ticket_type}`,
    ],
    qrPayload: ticket.qr_payload,
    footerLines: [FESTIVAL_EVENT_COPY.title],
  });
}

export async function buildFestivalInvoicePdf({ ticket, user }) {
  const invoice = buildFestivalInvoiceMetadata({ ticket, user });
  const domestic = ticket.ticket_type === "domestic";

  return createPdfWithQr({
    title: `Invoice ${invoice.invoiceNumber}`,
    subtitleLines: [
      `Date: ${invoice.invoiceDate}`,
      `Attendee: ${invoice.attendeeName}`,
      `Email: ${invoice.attendeeEmail}`,
      `Billing Name: ${invoice.billingName}`,
      `Billing Email: ${invoice.billingEmail}`,
      `Billing Phone: ${invoice.billingPhone || "-"}`,
      `Billing Address: ${[
        invoice.billingAddressLine1,
        invoice.billingAddressLine2,
        invoice.billingCity,
        invoice.billingStateOrProvince,
        invoice.billingPostalCode,
        invoice.billingCountry,
      ]
        .filter(Boolean)
        .join(", ")}`,
      domestic
        ? `GSTIN: ${invoice.gstin || invoice.taxIdNumber || "-"}`
        : `Passport / National ID: ${invoice.passportOrNationalId || "-"}`,
      `Description: ${invoice.description}`,
      `Base Amount: ${invoice.baseAmountMinor / 100}`,
      `${invoice.taxLabel}: ${invoice.taxAmountMinor / 100}`,
      `Total: ${invoice.totalAmountMinor / 100} ${invoice.currency}`,
    ],
    qrPayload: ticket.qr_payload,
    footerLines: [
      "Trust and Safety India Festival 2026",
      "Generated for compliance and attendee verification.",
    ],
  });
}
