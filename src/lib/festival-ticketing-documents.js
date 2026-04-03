import { readFileSync } from "node:fs";
import path from "node:path";
import { FESTIVAL_EVENT_COPY } from "./festival-ticketing-constants.js";
import { EVENT_CONFIG } from "./registration-constants.js";
import QRCode from "qrcode";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN = 40;
const HEADER_HEIGHT = 118;
const BRAND_GRADIENT_STOPS = [
  [0x55, 0x08, 0x9e],
  [0x9f, 0x00, 0x99],
  [0xff, 0x00, 0x80],
  [0xef, 0x57, 0x00],
  [0xff, 0xff, 0x00],
];
const SELLER_DETAILS = {
  legalName: "Centre for Social Research",
  addressLines: [
    "2, Nelson Mandela Marg",
    "Vasant Kunj, New Delhi - 110070, India",
  ],
  email: EVENT_CONFIG.contactEmail,
  phone: "+91 011 46131929",
  taxIdLabel: "PAN",
  gstin: "07AAATC0681P1ZH",
  pan: "AAATC0681P",
  stateCode: "07",
  stateName: "Delhi",
};

// SAC code for conference/event admission services
const SERVICE_SAC_CODE = "999596";

let cachedHeaderLogoDataUrl = null;

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

function formatMinorAmount(amountMinor, currency) {
  const amount = Number(amountMinor || 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildBillingAddress(invoice) {
  return [
    invoice.billingAddressLine1,
    invoice.billingAddressLine2,
    invoice.billingCity,
    invoice.billingStateOrProvince,
    invoice.billingPostalCode,
    invoice.billingCountry,
  ].filter(Boolean);
}

function readHeaderLogoDataUrl() {
  if (cachedHeaderLogoDataUrl) return cachedHeaderLogoDataUrl;

  try {
    const logoPath = path.join(process.cwd(), "public", "img", "tasi-csr-logo.png");
    const buffer = readFileSync(logoPath);
    cachedHeaderLogoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    cachedHeaderLogoDataUrl = null;
  }

  return cachedHeaderLogoDataUrl;
}

function drawGradientHeader(doc) {
  const segmentWidth = PAGE_WIDTH / BRAND_GRADIENT_STOPS.length;
  BRAND_GRADIENT_STOPS.forEach((color, index) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(index * segmentWidth, 0, segmentWidth + 1, HEADER_HEIGHT, "F");
  });
}

function drawWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  lines.forEach((line, index) => {
    doc.text(line, x, y + index * lineHeight);
  });
  return lines.length;
}

function drawKeyValueRows(doc, rows, x, y, labelWidth, valueWidth) {
  let currentY = y;

  rows.forEach((row) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(String(row.label || "").toUpperCase(), x, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    const lines = doc.splitTextToSize(String(row.value || "-"), valueWidth);
    lines.forEach((line, index) => {
      doc.text(line, x + labelWidth, currentY + index * 14);
    });

    currentY += Math.max(lines.length * 14, 18) + 4;
  });

  return currentY;
}

function drawSectionCard(doc, { title, rows, x, y, width }) {
  const estimatedHeight =
    46 +
    rows.reduce((total, row) => {
      const approxLines = doc.splitTextToSize(String(row.value || "-"), width - 135).length;
      return total + Math.max(approxLines * 14, 18) + 4;
    }, 0);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, width, estimatedHeight, 10, 10, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 15, 38);
  doc.text(title, x + 18, y + 24);

  return drawKeyValueRows(doc, rows, x + 18, y + 44, 92, width - 126);
}

function drawTotalsTable(doc, totals, x, y, width) {
  const rowHeight = 22;
  const totalHeight = totals.length * rowHeight + 18;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, width, totalHeight, 10, 10, "FD");

  let rowY = y + 24;
  totals.forEach((row, index) => {
    const emphasized = Boolean(row.emphasis);
    doc.setFont("helvetica", emphasized ? "bold" : "normal");
    doc.setFontSize(emphasized ? 12 : 11);
    doc.setTextColor(17, 24, 39);
    doc.text(row.label, x + 18, rowY);
    doc.text(row.value, x + width - 18, rowY, { align: "right" });

    if (index < totals.length - 1) {
      doc.setDrawColor(226, 232, 240);
      doc.line(x + 18, rowY + 8, x + width - 18, rowY + 8);
    }

    rowY += rowHeight;
  });
}

export function buildFestivalInvoiceMetadata({ ticket, user }) {
  const domestic = ticket.ticket_type === "domestic";
  const invoiceDate = getInvoiceDate(ticket.created_at);
  const baseAmountMinor = Number(ticket.base_amount_minor || 0);
  const taxAmountMinor = Number(ticket.tax_amount_minor || 0);

  // Determine if intra-state (buyer also in Delhi) for CGST/SGST vs IGST split
  const buyerState = (user.billing_state_or_province || user.state_or_province || "").trim();
  const isIntraState =
    domestic &&
    buyerState.toLowerCase().replace(/\s+/g, "") ===
      SELLER_DETAILS.stateName.toLowerCase().replace(/\s+/g, "");

  // Half of GST for CGST/SGST split (each 9%)
  const halfTaxMinor = Math.round(taxAmountMinor / 2);

  return {
    invoiceNumber: buildInvoiceNumber(
      domestic ? "DOM" : "INT",
      ticket.created_at,
      ticket.id,
    ),
    invoiceDate,
    currency: ticket.currency,
    taxLabel: domestic
      ? isIntraState
        ? "GST (CGST 9% + SGST 9%)"
        : "IGST (18%)"
      : "Zero-rated export",
    cgstLabel: "CGST (9%)",
    sgstLabel: "SGST (9%)",
    igstLabel: "IGST (18%)",
    isIntraState,
    taxAmountMinor,
    halfTaxMinor,
    totalAmountMinor: Number(ticket.total_amount_minor || 0),
    baseAmountMinor,
    attendeeName: user.full_name,
    attendeeEmail: user.email,
    country: user.country,
    billingName: user.billing_name || user.full_name,
    billingEmail: user.billing_email || user.email,
    billingPhone: user.billing_phone || user.phone || "",
    billingAddressLine1: user.billing_address_line1 || "",
    billingAddressLine2: user.billing_address_line2 || "",
    billingCity: user.billing_city || "",
    billingStateOrProvince: buyerState,
    billingPostalCode: user.billing_postal_code || "",
    billingCountry: user.billing_country || user.country,
    pan: user.pan || user.tax_id_number || "",
    gstin: user.gstin || "",
    passportOrNationalId: user.passport_or_national_id || "",
    description: `${FESTIVAL_EVENT_COPY.title} - ${FESTIVAL_EVENT_COPY.description}`,
    placeOfSupply: domestic ? `${FESTIVAL_EVENT_COPY.venue} (Event Location)` : "Export",
    sacCode: SERVICE_SAC_CODE,
  };
}

export function buildFestivalInvoiceDocumentModel({ ticket, user }) {
  const invoice = buildFestivalInvoiceMetadata({ ticket, user });
  const domestic = ticket.ticket_type === "domestic";
  const invoiceNumber = ticket.invoice_number || invoice.invoiceNumber;

  // Build GST totals rows: CGST + SGST for intra-state, IGST for inter-state/international
  const taxRows = domestic
    ? invoice.isIntraState
      ? [
          { label: "CGST (9%)", value: formatMinorAmount(invoice.halfTaxMinor, invoice.currency) },
          { label: "SGST (9%)", value: formatMinorAmount(invoice.halfTaxMinor, invoice.currency) },
        ]
      : [{ label: "IGST (18%)", value: formatMinorAmount(invoice.taxAmountMinor, invoice.currency) }]
    : [{ label: "Zero-rated (Export)", value: formatMinorAmount(0, invoice.currency) }];

  return {
    header: {
      eyebrow: EVENT_CONFIG.shortName,
      title: FESTIVAL_EVENT_COPY.title,
      subtitle: "Tax Invoice",
      logoDataUrl: readHeaderLogoDataUrl(),
    },
    meta: {
      invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      ticketNumber: ticket.ticket_number || "-",
      attendeeName: invoice.attendeeName,
      attendeeEmail: invoice.attendeeEmail,
      placeOfSupply: invoice.placeOfSupply,
    },
    seller: {
      legalName: SELLER_DETAILS.legalName,
      addressLines: SELLER_DETAILS.addressLines,
      email: SELLER_DETAILS.email,
      phone: SELLER_DETAILS.phone,
      pan: SELLER_DETAILS.pan,
      gstin: SELLER_DETAILS.gstin,
    },
    buyer: {
      billingName: invoice.billingName,
      billingEmail: invoice.billingEmail,
      billingPhone: invoice.billingPhone || "-",
      billingAddressLines: buildBillingAddress(invoice),
      // Domestic: PAN is mandatory, GSTIN is optional
      pan: domestic ? (invoice.pan || "-") : null,
      gstin: domestic ? (invoice.gstin || null) : null,
      // International: show Passport / National ID
      intlIdLabel: !domestic ? "Passport / National ID" : null,
      intlIdValue: !domestic ? (invoice.passportOrNationalId || "-") : null,
    },
    lineItems: [
      {
        description: invoice.description,
        sacCode: invoice.sacCode,
        quantity: "1",
        unitPrice: formatMinorAmount(invoice.baseAmountMinor, invoice.currency),
        amount: formatMinorAmount(invoice.baseAmountMinor, invoice.currency),
      },
    ],
    totals: [
      { label: "Taxable Amount", value: formatMinorAmount(invoice.baseAmountMinor, invoice.currency) },
      ...taxRows,
      {
        label: "Total",
        value: formatMinorAmount(invoice.totalAmountMinor, invoice.currency),
        emphasis: true,
      },
    ],
    notes: [
      `${FESTIVAL_EVENT_COPY.description}`,
      `${FESTIVAL_EVENT_COPY.venue} | ${FESTIVAL_EVENT_COPY.datesLabel}`,
      domestic
        ? "Tax invoice as required under Section 31 of CGST Act, 2017."
        : "Supply meant for export under Letter of Undertaking without payment of integrated tax.",
    ],
    qrPayload: ticket.qr_payload,
  };
}

async function createPdfWithQr({ title, subtitleLines = [], qrPayload, footerLines = [] }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  doc.setFillColor(20, 15, 38);
  doc.rect(0, 0, PAGE_WIDTH, 90, "F");
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

export async function buildFestivalBadgePdf({ ticket, user, profilePhotoDataUrl }) {
  const { jsPDF } = await import("jspdf");

  const BW = 419; // A5 width in pt
  const BH = 595; // A5 height in pt
  const GRAD_H = 130; // gradient header height

  const doc = new jsPDF({ unit: "pt", format: "a5" });

  // ── GRADIENT HEADER ───────────────────────────────────────────────────
  const segW = BW / BRAND_GRADIENT_STOPS.length;
  BRAND_GRADIENT_STOPS.forEach(([r, g, b], i) => {
    doc.setFillColor(r, g, b);
    doc.rect(i * segW, 0, segW + 1, GRAD_H, "F");
  });

  // Logo centered in header
  const logoDataUrl = readHeaderLogoDataUrl();
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", (BW - 180) / 2, 14, 180, 44);
  }

  // Event dates in amber below logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(253, 230, 138);
  doc.text("13–14 OCTOBER 2026  •  NEW DELHI, INDIA", BW / 2, 76, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("ATTENDEE BADGE", BW / 2, 93, { align: "center" });

  // ── OUTER BORDER ──────────────────────────────────────────────────────
  doc.setDrawColor(85, 8, 158);
  doc.setLineWidth(2.5);
  doc.roundedRect(2.5, 2.5, BW - 5, BH - 5, 6, 6, "S");

  // ── PROFILE PHOTO (if provided) ────────────────────────────────────────
  // Photo "pops out" of the header, centred horizontally
  const photoSize = 64;
  const photoX = (BW - photoSize) / 2;
  const photoY = GRAD_H - 22; // overlaps header bottom by 22pt

  if (profilePhotoDataUrl) {
    // White background ring (acts as circular border)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.roundedRect(photoX - 5, photoY - 5, photoSize + 10, photoSize + 10, 12, 12, "F");
    // Photo
    doc.addImage(profilePhotoDataUrl, "JPEG", photoX, photoY, photoSize, photoSize);
    // Subtle brand-colored outline
    doc.setDrawColor(85, 8, 158);
    doc.setLineWidth(1.5);
    doc.roundedRect(photoX - 5, photoY - 5, photoSize + 10, photoSize + 10, 12, 12, "S");
  }

  // Body content starts below the photo (or below header if no photo)
  const bodyStartY = profilePhotoDataUrl
    ? photoY + photoSize + 5 + 16 // photo bottom + gap
    : GRAD_H + 16;

  // ── PASS TYPE PILL ────────────────────────────────────────────────────
  const passTypeLabelMap = {
    domestic: "DOMESTIC DELEGATE",
    international: "INTERNATIONAL DELEGATE",
    vip: "VIP PASS",
  };
  const passTypeLabel =
    passTypeLabelMap[ticket.ticket_type] ||
    (ticket.ticket_type || "DELEGATE").toUpperCase();

  const pillColorMap = {
    domestic: [85, 8, 158],
    international: [13, 95, 163],
    vip: [239, 87, 0],
  };
  const pillColor = pillColorMap[ticket.ticket_type] || [85, 8, 158];

  const pillY = bodyStartY;
  const pillH = 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const pillTextW = doc.getTextWidth(passTypeLabel);
  const pillW = pillTextW + 40;
  const pillX = (BW - pillW) / 2;
  doc.setFillColor(...pillColor);
  doc.roundedRect(pillX, pillY, pillW, pillH, pillH / 2, pillH / 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(passTypeLabel, BW / 2, pillY + 17, { align: "center" });

  // ── ATTENDEE NAME ─────────────────────────────────────────────────────
  const nameStartY = pillY + pillH + (profilePhotoDataUrl ? 18 : 28);
  const nameFontSize = profilePhotoDataUrl ? 24 : 28;
  const nameLineH = profilePhotoDataUrl ? 30 : 34;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(nameFontSize);
  doc.setTextColor(20, 15, 38);
  const nameLines = doc.splitTextToSize(user.full_name || "Attendee", BW - 60);
  let currentY = nameStartY;
  nameLines.slice(0, 2).forEach((line) => {
    doc.text(line, BW / 2, currentY, { align: "center" });
    currentY += nameLineH;
  });

  // ── ORGANIZATION ──────────────────────────────────────────────────────
  const orgY = currentY + (profilePhotoDataUrl ? 4 : 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  const orgLines = doc.splitTextToSize(user.organization || "Festival Attendee", BW - 80);
  doc.text(orgLines[0], BW / 2, orgY, { align: "center" });
  let orgEndY = orgY + 16;

  // Show country for international delegates
  if (user.country && user.country !== "IN") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(user.country, BW / 2, orgEndY + 7, { align: "center" });
    orgEndY += 18;
  }

  // ── HAIRLINE DIVIDER ──────────────────────────────────────────────────
  const divY = orgEndY + (profilePhotoDataUrl ? 12 : 18);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.75);
  doc.line(50, divY, BW - 50, divY);

  // ── QR CODE ───────────────────────────────────────────────────────────
  const qrCardY = divY + 14;
  const qrSize = profilePhotoDataUrl ? 132 : 160;
  const qrPad = profilePhotoDataUrl ? 12 : 16;
  const qrCardW = qrSize + qrPad * 2;
  const qrCardX = (BW - qrCardW) / 2;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(qrCardX, qrCardY, qrCardW, qrSize + qrPad * 2, 10, 10, "FD");

  if (ticket.qr_payload) {
    const qrDataUrl = await QRCode.toDataURL(ticket.qr_payload, {
      margin: 1,
      width: 220,
      color: { dark: "#140f26", light: "#FFFFFF" },
    });
    doc.addImage(qrDataUrl, "PNG", qrCardX + qrPad, qrCardY + qrPad, qrSize, qrSize);
  }

  // ── BADGE NUMBER ──────────────────────────────────────────────────────
  const qrCardBottom = qrCardY + qrSize + qrPad * 2;
  const badgeLabelY = qrCardBottom + 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("BADGE NO.", BW / 2, badgeLabelY, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 15, 38);
  doc.text(String(ticket.badge_number || ticket.ticket_number || "-"), BW / 2, badgeLabelY + 16, {
    align: "center",
  });

  // ── FOOTER GRADIENT STRIP ─────────────────────────────────────────────
  const footerH = 58;
  const footerY = BH - footerH;
  const footSegW = BW / BRAND_GRADIENT_STOPS.length;
  BRAND_GRADIENT_STOPS.forEach(([r, g, b], i) => {
    doc.setFillColor(Math.round(r * 0.65), Math.round(g * 0.65), Math.round(b * 0.65));
    doc.rect(i * footSegW, footerY, footSegW + 1, footerH, "F");
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(FESTIVAL_EVENT_COPY.title, BW / 2, footerY + 21, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(253, 230, 138);
  doc.text(
    `csrindia.org  •  ${FESTIVAL_EVENT_COPY.datesLabel}  •  ${FESTIVAL_EVENT_COPY.venue}`,
    BW / 2,
    footerY + 38,
    { align: "center" },
  );

  return Buffer.from(doc.output("arraybuffer"));
}

export async function buildFestivalInvoicePdf({ ticket, user }) {
  const { jsPDF } = await import("jspdf");
  const model = buildFestivalInvoiceDocumentModel({ ticket, user });
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  drawGradientHeader(doc);

  if (model.header.logoDataUrl) {
    doc.addImage(model.header.logoDataUrl, "PNG", PAGE_MARGIN, 24, 44, 44);
  }

  doc.setTextColor(253, 230, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(model.header.eyebrow, PAGE_MARGIN + 58, 36);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.text(model.header.title, PAGE_MARGIN + 58, 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text(model.header.subtitle, PAGE_MARGIN + 58, 86);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 15, 38);
  doc.text("Invoice", PAGE_MARGIN, 154);
  doc.setFontSize(12);
  doc.text(model.meta.invoiceNumber, PAGE_WIDTH - PAGE_MARGIN, 154, { align: "right" });

  const topCardY = 176;
  const columnGap = 18;
  const columnWidth = (PAGE_WIDTH - PAGE_MARGIN * 2 - columnGap) / 2;

  const sellerRows = [
    { label: "Seller", value: model.seller.legalName },
    { label: "Address", value: model.seller.addressLines.join(", ") },
    { label: "PAN", value: model.seller.pan },
    { label: "GSTIN", value: model.seller.gstin },
    { label: "Email", value: model.seller.email },
    { label: "Phone", value: model.seller.phone },
  ];
  const buyerRows = [
    { label: "Bill To", value: model.buyer.billingName },
    { label: "Email", value: model.buyer.billingEmail },
    { label: "Phone", value: model.buyer.billingPhone },
    { label: "Address", value: model.buyer.billingAddressLines.join(", ") || "-" },
    ...(model.buyer.pan != null ? [{ label: "PAN", value: model.buyer.pan }] : []),
    ...(model.buyer.gstin ? [{ label: "GSTIN", value: model.buyer.gstin }] : []),
    ...(model.buyer.intlIdLabel ? [{ label: model.buyer.intlIdLabel, value: model.buyer.intlIdValue }] : []),
  ];

  drawSectionCard(doc, {
    title: "Seller Details",
    rows: sellerRows,
    x: PAGE_MARGIN,
    y: topCardY,
    width: columnWidth,
  });
  drawSectionCard(doc, {
    title: "Billing Details",
    rows: buyerRows,
    x: PAGE_MARGIN + columnWidth + columnGap,
    y: topCardY,
    width: columnWidth,
  });

  const metaRows = [
    { label: "Invoice Date", value: model.meta.invoiceDate },
    { label: "Ticket Number", value: model.meta.ticketNumber },
    { label: "Place of Supply", value: model.meta.placeOfSupply || "-" },
    { label: "Attendee", value: model.meta.attendeeName },
    { label: "Attendee Email", value: model.meta.attendeeEmail },
  ];

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PAGE_MARGIN, 376, PAGE_WIDTH - PAGE_MARGIN * 2, 128, 10, 10, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 15, 38);
  doc.text("Invoice Summary", PAGE_MARGIN + 18, 400);
  drawKeyValueRows(
    doc,
    metaRows,
    PAGE_MARGIN + 18,
    420,
    108,
    PAGE_WIDTH - PAGE_MARGIN * 2 - 144,
  );

  const tableY = 526;
  const tableWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const col1 = PAGE_MARGIN + 18;
  const col2 = PAGE_MARGIN + 298;
  const col3 = PAGE_MARGIN + 358;
  const col4 = PAGE_MARGIN + tableWidth - 18;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(PAGE_MARGIN, tableY, tableWidth, 96, 10, 10, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("DESCRIPTION", col1, tableY + 20);
  doc.text("SAC", col2, tableY + 20);
  doc.text("QTY", col3, tableY + 20);
  doc.text("AMOUNT", col4, tableY + 20, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.line(PAGE_MARGIN + 18, tableY + 28, PAGE_MARGIN + tableWidth - 18, tableY + 28);

  const item = model.lineItems[0];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  drawWrappedText(doc, item.description, col1, tableY + 46, 268, 13);
  doc.text(item.sacCode || "-", col2, tableY + 46);
  doc.text(item.quantity, col3, tableY + 46);
  doc.text(item.amount, col4, tableY + 46, { align: "right" });

  // Totals and QR positioned below the table
  const totalsY = 642;
  const totalsWidth = tableWidth - 218;
  drawTotalsTable(doc, model.totals, PAGE_MARGIN + 218, totalsY, totalsWidth, model.totals.length * 22 + 18);

  if (model.qrPayload) {
    const qrDataUrl = await QRCode.toDataURL(model.qrPayload, {
      margin: 1,
      width: 180,
      color: { dark: "#140f26", light: "#FFFFFF" },
    });
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(PAGE_MARGIN, totalsY, 196, 190, 10, 10, "FD");
    doc.addImage(qrDataUrl, "PNG", PAGE_MARGIN + 18, totalsY + 15, 156, 156);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  let noteY = 790;
  model.notes.forEach((note) => {
    doc.text(note, PAGE_MARGIN, noteY);
    noteY += 14;
  });

  return Buffer.from(doc.output("arraybuffer"));
}
