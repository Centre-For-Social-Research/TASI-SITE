/**
 * Pure-data helpers for festival invoice metadata and document model.
 * No JSX — safe to import in Node.js test runners without a JSX transform.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { FESTIVAL_EVENT_COPY } from './festival-ticketing-constants.js';
import { EVENT_CONFIG } from './registration-constants.js';

const SELLER_DETAILS = {
  legalName: 'Centre for Social Research',
  addressLines: [
    '2, Nelson Mandela Marg',
    'Vasant Kunj, New Delhi - 110070, India',
  ],
  email: EVENT_CONFIG.contactEmail,
  phone: '+91 011 46131929',
  taxIdLabel: 'PAN',
  gstin: '07AAATC0681P1ZH',
  pan: 'AAATC0681P',
  stateCode: '07',
  stateName: 'Delhi',
};

// SAC code for conference/event admission services
const SERVICE_SAC_CODE = '999596';

let cachedHeaderLogoDataUrl = null;

function getInvoiceDate(createdAt) {
  const date = createdAt ? new Date(createdAt) : new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildInvoiceNumber(prefix, createdAt, sourceId) {
  const year = new Date(createdAt || Date.now()).getUTCFullYear();
  const suffix =
    String(sourceId || '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-6)
      .toUpperCase() || '000001';
  return `INV-${prefix}-${year}-${suffix}`;
}

function formatMinorAmount(amountMinor, currency) {
  const amount = Number(amountMinor || 0) / 100;
  const num = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  // Use "Rs." instead of ₹ — Helvetica built-in font doesn't include the rupee glyph
  return currency && currency !== 'INR' ? `${currency} ${num}` : `Rs. ${num}`;
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

export function readHeaderLogoDataUrl() {
  if (cachedHeaderLogoDataUrl) return cachedHeaderLogoDataUrl;

  try {
    const logoPath = path.join(
      process.cwd(),
      'public',
      'img',
      'tasi-csr-logo.png'
    );
    const buffer = readFileSync(logoPath);
    cachedHeaderLogoDataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
  } catch {
    cachedHeaderLogoDataUrl = null;
  }

  return cachedHeaderLogoDataUrl;
}

export function buildFestivalInvoiceMetadata({ ticket, user }) {
  const domestic = ticket.ticket_type === 'domestic';
  const invoiceDate = getInvoiceDate(ticket.created_at);
  const baseAmountMinor = Number(ticket.base_amount_minor || 0);
  const taxAmountMinor = Number(ticket.tax_amount_minor || 0);

  // Half of GST for CGST/SGST split (each 9%)
  const halfTaxMinor = Math.round(taxAmountMinor / 2);

  const buyerState = (
    user.billing_state_or_province ||
    user.state_or_province ||
    ''
  ).trim();

  return {
    invoiceNumber: buildInvoiceNumber(
      domestic ? 'DOM' : 'INT',
      ticket.created_at,
      ticket.id
    ),
    invoiceDate,
    currency: ticket.currency,
    taxLabel: domestic ? 'GST' : 'Zero-rated export',
    taxAmountMinor,
    halfTaxMinor,
    totalAmountMinor: Number(ticket.total_amount_minor || 0),
    baseAmountMinor,
    attendeeName: user.full_name,
    attendeeEmail: user.email,
    country: user.country,
    billingName: user.billing_name || user.full_name,
    billingEmail: user.billing_email || user.email,
    billingPhone: user.billing_phone || user.phone || '',
    billingAddressLine1: user.billing_address_line1 || '',
    billingAddressLine2: user.billing_address_line2 || '',
    billingCity: user.billing_city || '',
    billingStateOrProvince: buyerState,
    billingPostalCode: user.billing_postal_code || '',
    billingCountry: user.billing_country || user.country,
    pan: user.pan || user.tax_id_number || '',
    gstin: user.gstin || '',
    passportOrNationalId: user.passport_or_national_id || '',
    description: `${FESTIVAL_EVENT_COPY.title} - ${FESTIVAL_EVENT_COPY.description}`,
    placeOfSupply: domestic
      ? `${FESTIVAL_EVENT_COPY.venue} (Event Location)`
      : 'Export',
    sacCode: SERVICE_SAC_CODE,
  };
}

export function buildFestivalInvoiceDocumentModel({ ticket, user }) {
  const invoice = buildFestivalInvoiceMetadata({ ticket, user });
  const domestic = ticket.ticket_type === 'domestic';
  const invoiceNumber = ticket.invoice_number || invoice.invoiceNumber;

  const taxRows = domestic
    ? [
        {
          label: 'GST',
          value: formatMinorAmount(invoice.taxAmountMinor, invoice.currency),
        },
      ]
    : [
        {
          label: 'Zero-rated (Export)',
          value: formatMinorAmount(0, invoice.currency),
        },
      ];

  return {
    header: {
      eyebrow: EVENT_CONFIG.shortName,
      title: FESTIVAL_EVENT_COPY.title,
      subtitle: 'Tax Invoice',
      logoDataUrl: readHeaderLogoDataUrl(),
    },
    meta: {
      invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      ticketNumber: ticket.ticket_number || '-',
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
      taxIdLabel: SELLER_DETAILS.taxIdLabel,
    },
    buyer: {
      billingName: invoice.billingName,
      billingEmail: invoice.billingEmail,
      billingPhone: invoice.billingPhone || '-',
      billingAddressLines: buildBillingAddress(invoice),
      // Domestic: PAN is mandatory, GSTIN is optional
      pan: domestic ? invoice.pan || '-' : null,
      gstin: domestic ? invoice.gstin || null : null,
      taxIdLabel: domestic
        ? invoice.gstin
          ? 'GSTIN'
          : 'PAN'
        : 'Passport / National ID',
      // International: show Passport / National ID
      intlIdLabel: !domestic ? 'Passport / National ID' : null,
      intlIdValue: !domestic ? invoice.passportOrNationalId || '-' : null,
    },
    lineItems: [
      {
        description: invoice.description,
        sacCode: invoice.sacCode,
        quantity: '1',
        unitPrice: formatMinorAmount(invoice.baseAmountMinor, invoice.currency),
        amount: formatMinorAmount(invoice.baseAmountMinor, invoice.currency),
      },
    ],
    totals: [
      {
        label: 'Base Amount',
        value: formatMinorAmount(invoice.baseAmountMinor, invoice.currency),
      },
      ...taxRows,
      {
        label: 'Total',
        value: formatMinorAmount(invoice.totalAmountMinor, invoice.currency),
        emphasis: true,
      },
    ],
    notes: [
      `${FESTIVAL_EVENT_COPY.description}`,
      `${FESTIVAL_EVENT_COPY.venue} | ${FESTIVAL_EVENT_COPY.datesLabel}`,
      domestic
        ? 'Tax invoice as required under Section 31 of CGST Act, 2017.'
        : 'Supply meant for export under Letter of Undertaking without payment of integrated tax.',
      'Generated for compliance and attendee verification.',
    ],
    qrPayload: ticket.qr_payload,
  };
}
