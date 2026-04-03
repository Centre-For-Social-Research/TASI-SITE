import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { Document, Page, View, Text, Image, renderToBuffer } from "@react-pdf/renderer";
import { FESTIVAL_EVENT_COPY } from "./festival-ticketing-constants.js";
import { EVENT_CONFIG } from "./registration-constants.js";
import QRCode from "qrcode";

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

// â”€â”€ REACT PDF HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const toHex = (r, g, b) =>
  `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

const GradientStrip = ({ height, darken = 1 }) => (
  <View style={{ flexDirection: "row", height }}>
    {BRAND_GRADIENT_STOPS.map(([r, g, b], i) => (
      <View key={i} style={{ flex: 1, backgroundColor: toHex(Math.round(r * darken), Math.round(g * darken), Math.round(b * darken)) }} />
    ))}
  </View>
);

// â”€â”€ FESTIVAL TICKET DOCUMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FestivalTicketDocument = ({ title, subtitleLines, qrDataUrl, footerLines }) => (
  <Document>
    <Page size="A4" style={{ backgroundColor: "#ffffff", fontFamily: "Helvetica" }}>
      {/* Navy header */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 90, backgroundColor: "#140f26", justifyContent: "center", paddingLeft: 40 }}>
        <Text style={{ color: "#ffffff", fontSize: 24, fontFamily: "Helvetica-Bold" }}>{title}</Text>
      </View>
      {/* Subtitle lines */}
      <View style={{ paddingTop: 110, paddingHorizontal: 40 }}>
        {subtitleLines.map((line, i) => (
          <Text key={i} style={{ fontSize: 11, color: "#140f26", marginBottom: 6 }}>{line}</Text>
        ))}
      </View>
      {/* QR code */}
      {qrDataUrl && (
        <Image src={qrDataUrl} style={{ position: "absolute", top: 120, right: 40, width: 160, height: 160 }} />
      )}
      {/* Footer */}
      <View style={{ position: "absolute", bottom: 82, left: 40 }}>
        {footerLines.map((line, i) => (
          <Text key={i} style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{line}</Text>
        ))}
      </View>
    </Page>
  </Document>
);

// â”€â”€ FESTIVAL BADGE DOCUMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BADGE_W = 419; // A5 width in pt
const BADGE_H = 595; // A5 height in pt
const GRAD_H = 130;  // gradient header height in pt
const FOOTER_H = 58; // footer strip height in pt

const FestivalBadgeDocument = ({ ticket, user, profilePhotoDataUrl, qrDataUrl, logoDataUrl }) => {
  const hasPhoto = Boolean(profilePhotoDataUrl);
  const photoSize = 64;
  const photoX = (BADGE_W - photoSize) / 2;
  const photoY = GRAD_H - 22;

  const passTypeLabelMap = {
    domestic: "DOMESTIC DELEGATE",
    international: "INTERNATIONAL DELEGATE",
    vip: "VIP PASS",
  };
  const passTypeLabel =
    passTypeLabelMap[ticket.ticket_type] ||
    (ticket.ticket_type || "DELEGATE").toUpperCase();

  const pillColorMap = {
    domestic: "#55089e",
    international: "#0d5fa3",
    vip: "#ef5700",
  };
  const pillColor = pillColorMap[ticket.ticket_type] || "#55089e";

  const bodyStartY = hasPhoto ? photoY + photoSize + 21 : GRAD_H + 16;
  const qrSize = hasPhoto ? 132 : 160;
  const qrPad = hasPhoto ? 12 : 16;

  return (
    <Document>
      <Page size={[BADGE_W, BADGE_H]} style={{ backgroundColor: "#ffffff", fontFamily: "Helvetica" }}>
        {/* Gradient header */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: GRAD_H }}>
          <GradientStrip height={GRAD_H} />
        </View>

        {/* Logo centered in header */}
        {logoDataUrl && (
          <Image src={logoDataUrl} style={{ position: "absolute", top: 14, left: (BADGE_W - 180) / 2, width: 180, height: 44 }} />
        )}

        {/* Event dates in amber */}
        <Text style={{ position: "absolute", top: 67, left: 0, right: 0, textAlign: "center", fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#fde68a" }}>
          13â€“14 OCTOBER 2026  â€¢  NEW DELHI, INDIA
        </Text>

        {/* "ATTENDEE BADGE" subtitle */}
        <Text style={{ position: "absolute", top: 84, left: 0, right: 0, textAlign: "center", fontSize: 7.5, color: "#ffffff" }}>
          ATTENDEE BADGE
        </Text>

        {/* Outer border */}
        <View style={{ position: "absolute", top: 2.5, left: 2.5, width: BADGE_W - 5, height: BADGE_H - 5, borderWidth: 2.5, borderColor: "#55089e", borderRadius: 6 }} />

        {/* Profile photo (if provided) */}
        {hasPhoto && (
          <>
            <View style={{ position: "absolute", top: photoY - 5, left: photoX - 5, width: photoSize + 10, height: photoSize + 10, backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1.5, borderColor: "#55089e" }} />
            <Image src={profilePhotoDataUrl} style={{ position: "absolute", top: photoY, left: photoX, width: photoSize, height: photoSize, borderRadius: 8 }} />
          </>
        )}

        {/* Body content area */}
        <View style={{ position: "absolute", top: bodyStartY, left: 30, right: 30, bottom: FOOTER_H + 10, alignItems: "center" }}>
          {/* Pass type pill */}
          <View style={{ backgroundColor: pillColor, borderRadius: 13, paddingHorizontal: 20, paddingVertical: 6, marginBottom: 16 }}>
            <Text style={{ color: "#ffffff", fontSize: 9, fontFamily: "Helvetica-Bold" }}>{passTypeLabel}</Text>
          </View>

          {/* Attendee name */}
          <Text style={{ fontSize: hasPhoto ? 24 : 28, fontFamily: "Helvetica-Bold", color: "#140f26", textAlign: "center", marginBottom: 8 }}>
            {user.full_name || "Attendee"}
          </Text>

          {/* Organization */}
          <Text style={{ fontSize: 11, color: "#475569", textAlign: "center", marginBottom: hasPhoto ? 4 : 6 }}>
            {user.organization || "Festival Attendee"}
          </Text>

          {/* Country (international only) */}
          {user.country && user.country !== "IN" && (
            <Text style={{ fontSize: 9, color: "#64748b", textAlign: "center", marginBottom: 4 }}>
              {user.country}
            </Text>
          )}

          {/* Hairline divider */}
          <View style={{ height: 0.75, backgroundColor: "#e2e8f0", alignSelf: "stretch", marginVertical: 12, marginHorizontal: 20 }} />

          {/* QR card */}
          {qrDataUrl && (
            <View style={{ borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 10, padding: qrPad, backgroundColor: "#ffffff", marginBottom: 12 }}>
              <Image src={qrDataUrl} style={{ width: qrSize, height: qrSize }} />
            </View>
          )}

          {/* Badge number */}
          <Text style={{ fontSize: 8, color: "#64748b", textAlign: "center", marginBottom: 4 }}>BADGE NO.</Text>
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: "#140f26", textAlign: "center" }}>
            {String(ticket.badge_number || ticket.ticket_number || "-")}
          </Text>
        </View>

        {/* Footer gradient strip */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: FOOTER_H }}>
          <GradientStrip height={FOOTER_H} darken={0.65} />
        </View>

        {/* Footer event title */}
        <Text style={{ position: "absolute", bottom: FOOTER_H - 21, left: 0, right: 0, textAlign: "center", fontSize: 10, fontFamily: "Helvetica-Bold", color: "#ffffff" }}>
          {FESTIVAL_EVENT_COPY.title}
        </Text>

        {/* Footer URL / dates */}
        <Text style={{ position: "absolute", bottom: FOOTER_H - 38, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "#fde68a" }}>
          {`csrindia.org  â€¢  ${FESTIVAL_EVENT_COPY.datesLabel}  â€¢  ${FESTIVAL_EVENT_COPY.venue}`}
        </Text>
      </Page>
    </Document>
  );
};

// â”€â”€ FESTIVAL INVOICE DOCUMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const KVRow = ({ label, value }) => (
  <View style={{ marginBottom: 10 }}>
    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase", marginBottom: 2 }}>{label}</Text>
    <Text style={{ fontSize: 11, color: "#111827" }}>{String(value || "-")}</Text>
  </View>
);

const InvoiceCard = ({ title, rows, style }) => (
  <View style={[{ flex: 1, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 18, backgroundColor: "#ffffff" }, style]}>
    <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: "#140f26", marginBottom: 14 }}>{title}</Text>
    {rows.map((row, i) => <KVRow key={i} label={row.label} value={row.value} />)}
  </View>
);

const FestivalInvoiceDocument = ({ model, qrDataUrl }) => {
  const { header, meta, seller, buyer, lineItems, totals, notes } = model;
  const item = lineItems[0];

  const sellerRows = [
    { label: "Seller", value: seller.legalName },
    { label: "Address", value: seller.addressLines.join(", ") },
    { label: "PAN", value: seller.pan },
    { label: "GSTIN", value: seller.gstin },
    { label: "Email", value: seller.email },
    { label: "Phone", value: seller.phone },
  ];
  const buyerRows = [
    { label: "Bill To", value: buyer.billingName },
    { label: "Email", value: buyer.billingEmail },
    { label: "Phone", value: buyer.billingPhone },
    { label: "Address", value: buyer.billingAddressLines.join(", ") || "-" },
    ...(buyer.pan != null ? [{ label: "PAN", value: buyer.pan }] : []),
    ...(buyer.gstin ? [{ label: "GSTIN", value: buyer.gstin }] : []),
    ...(buyer.intlIdLabel ? [{ label: buyer.intlIdLabel, value: buyer.intlIdValue }] : []),
  ];
  const metaRows = [
    { label: "Invoice Date", value: meta.invoiceDate },
    { label: "Ticket Number", value: meta.ticketNumber },
    { label: "Place of Supply", value: meta.placeOfSupply || "-" },
    { label: "Attendee", value: meta.attendeeName },
    { label: "Attendee Email", value: meta.attendeeEmail },
  ];

  return (
    <Document>
      <Page size="A4" style={{ backgroundColor: "#ffffff", fontFamily: "Helvetica" }}>
        {/* Gradient header (absolute background) */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 118, flexDirection: "row" }}>
          {BRAND_GRADIENT_STOPS.map(([r, g, b], i) => (
            <View key={i} style={{ flex: 1, backgroundColor: toHex(r, g, b) }} />
          ))}
        </View>

        {/* Logo */}
        {header.logoDataUrl && (
          <Image src={header.logoDataUrl} style={{ position: "absolute", top: 24, left: 40, width: 44, height: 44 }} />
        )}

        {/* Eyebrow */}
        <Text style={{ position: "absolute", top: 36, left: 98, fontSize: 12, fontFamily: "Helvetica-Bold", color: "#fde68a", letterSpacing: 1.5 }}>
          {header.eyebrow}
        </Text>

        {/* Title */}
        <Text style={{ position: "absolute", top: 56, left: 98, fontSize: 22, fontFamily: "Helvetica-Bold", color: "#ffffff" }}>
          {header.title}
        </Text>

        {/* "Tax Invoice" subtitle */}
        <Text style={{ position: "absolute", top: 82, left: 98, fontSize: 13, color: "#ffffff" }}>
          {header.subtitle}
        </Text>

        {/* Body */}
        <View style={{ paddingTop: 136, paddingHorizontal: 40 }}>
          {/* Invoice title row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: "#140f26" }}>Invoice</Text>
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: "#140f26" }}>{meta.invoiceNumber}</Text>
          </View>

          {/* Two-column cards */}
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <InvoiceCard title="Seller Details" rows={sellerRows} style={{ marginRight: 9 }} />
            <InvoiceCard title="Billing Details" rows={buyerRows} style={{ marginLeft: 9 }} />
          </View>

          {/* Invoice Summary */}
          <View style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 18, backgroundColor: "#ffffff", marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: "#140f26", marginBottom: 14 }}>Invoice Summary</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {metaRows.map((row, i) => (
                <View key={i} style={{ width: "50%", marginBottom: 10 }}>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase", marginBottom: 2 }}>{row.label}</Text>
                  <Text style={{ fontSize: 11, color: "#111827" }}>{String(row.value || "-")}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Line Items */}
          <View style={{ borderRadius: 10, backgroundColor: "#f8fafc", padding: 10, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <Text style={{ flex: 3.5, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#64748b" }}>DESCRIPTION</Text>
              <Text style={{ flex: 0.8, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#64748b" }}>SAC</Text>
              <Text style={{ flex: 0.6, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#64748b" }}>QTY</Text>
              <Text style={{ flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#64748b", textAlign: "right" }}>AMOUNT</Text>
            </View>
            <View style={{ height: 0.5, backgroundColor: "#e2e8f0", marginBottom: 8 }} />
            <View style={{ flexDirection: "row" }}>
              <Text style={{ flex: 3.5, fontSize: 10, color: "#111827" }}>{item?.description}</Text>
              <Text style={{ flex: 0.8, fontSize: 10, color: "#111827" }}>{item?.sacCode || "-"}</Text>
              <Text style={{ flex: 0.6, fontSize: 10, color: "#111827" }}>{item?.quantity}</Text>
              <Text style={{ flex: 1, fontSize: 10, color: "#111827", textAlign: "right" }}>{item?.amount}</Text>
            </View>
          </View>

          {/* Bottom row: QR + Totals */}
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            {qrDataUrl && (
              <View style={{ width: 196, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 18, backgroundColor: "#ffffff", marginRight: 16, alignItems: "center", justifyContent: "center" }}>
                <Image src={qrDataUrl} style={{ width: 156, height: 156 }} />
              </View>
            )}
            <View style={{ flex: 1, borderRadius: 10, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", padding: 10 }}>
              {totals.map((row, i) => (
                <View key={i}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
                    <Text style={row.emphasis ? { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#111827" } : { fontSize: 11, color: "#111827" }}>{row.label}</Text>
                    <Text style={row.emphasis ? { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "right" } : { fontSize: 11, color: "#111827", textAlign: "right" }}>{row.value}</Text>
                  </View>
                  {i < totals.length - 1 && <View style={{ height: 0.5, backgroundColor: "#e2e8f0" }} />}
                </View>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View>
            {notes.map((note, i) => (
              <Text key={i} style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>{note}</Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

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

export async function buildFestivalTicketPdf({ ticket, user }) {
  let qrDataUrl = null;
  if (ticket.qr_payload) {
    qrDataUrl = await QRCode.toDataURL(ticket.qr_payload, {
      margin: 1,
      width: 220,
      color: { dark: "#140f26", light: "#FFFFFF" },
    });
  }

  return renderToBuffer(
    <FestivalTicketDocument
      title="TASI 2026 Festival Ticket"
      subtitleLines={[
        `Ticket Number: ${ticket.ticket_number}`,
        `Attendee: ${user.full_name}`,
        `Organization: ${user.organization || "Independent attendee"}`,
        `Ticket Type: ${ticket.ticket_type}`,
        `Event: ${FESTIVAL_EVENT_COPY.title}`,
        `Dates: ${FESTIVAL_EVENT_COPY.datesLabel}`,
      ]}
      qrDataUrl={qrDataUrl}
      footerLines={[FESTIVAL_EVENT_COPY.venue, FESTIVAL_EVENT_COPY.description]}
    />,
  );
}

export async function buildFestivalBadgePdf({ ticket, user, profilePhotoDataUrl }) {
  let qrDataUrl = null;
  if (ticket.qr_payload) {
    qrDataUrl = await QRCode.toDataURL(ticket.qr_payload, {
      margin: 1,
      width: 220,
      color: { dark: "#140f26", light: "#FFFFFF" },
    });
  }

  const logoDataUrl = readHeaderLogoDataUrl();

  return renderToBuffer(
    <FestivalBadgeDocument
      ticket={ticket}
      user={user}
      profilePhotoDataUrl={profilePhotoDataUrl}
      qrDataUrl={qrDataUrl}
      logoDataUrl={logoDataUrl}
    />,
  );
}

export async function buildFestivalInvoicePdf({ ticket, user }) {
  const model = buildFestivalInvoiceDocumentModel({ ticket, user });

  let qrDataUrl = null;
  if (model.qrPayload) {
    qrDataUrl = await QRCode.toDataURL(model.qrPayload, {
      margin: 1,
      width: 180,
      color: { dark: "#140f26", light: "#FFFFFF" },
    });
  }

  return renderToBuffer(<FestivalInvoiceDocument model={model} qrDataUrl={qrDataUrl} />);
}
