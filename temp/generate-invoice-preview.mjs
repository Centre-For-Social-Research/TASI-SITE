import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildFestivalInvoiceDocumentModel,
  buildFestivalInvoicePdf,
} from "../src/lib/festival-ticketing-documents.js";

const ticket = {
  id: "ticket-preview-1",
  ticket_number: "TASI-DOM-00001",
  invoice_number: "INV-DOM-2026-VIEW01",
  ticket_type: "domestic",
  currency: "INR",
  base_amount_minor: 1000000,
  tax_amount_minor: 180000,
  total_amount_minor: 1180000,
  created_at: "2026-07-01T10:00:00.000Z",
  qr_payload: "TASI2026:ticket-preview-1:signature",
};

const user = {
  full_name: "Aditi Rao",
  email: "aditi@example.com",
  phone: "+91 9876543210",
  organization: "Example Org",
  country: "IN",
  billing_name: "Aditi Rao",
  billing_email: "billing@example.com",
  billing_phone: "+91 9876543210",
  billing_address_line1: "221B Baker Street",
  billing_city: "New Delhi",
  billing_state_or_province: "Delhi",
  billing_postal_code: "110001",
  billing_country: "India",
  tax_id_number: "ABCDE1234F",
  pan: "ABCDE1234F",
  gstin: "07ABCDE1234F1Z5",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderRows(rows) {
  return rows
    .map(
      (row) => `
        <div class="kv-row">
          <div class="kv-label">${escapeHtml(row.label)}</div>
          <div class="kv-value">${escapeHtml(row.value || "-")}</div>
        </div>
      `,
    )
    .join("");
}

function renderPreview(model) {
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

  const metaRows = [
    { label: "Invoice Date", value: model.meta.invoiceDate },
    { label: "Ticket Number", value: model.meta.ticketNumber },
    { label: "Place of Supply", value: model.meta.placeOfSupply || "-" },
    { label: "Attendee", value: model.meta.attendeeName },
    { label: "Attendee Email", value: model.meta.attendeeEmail },
  ];

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Invoice Preview</title>
      <style>
        :root {
          --paper: #ffffff;
          --ink: #140f26;
          --muted: #64748b;
          --line: #e2e8f0;
          --panel: #f8fafc;
          --gold: #fde68a;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #efe7da;
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
        }
        .frame {
          width: 900px;
          margin: 24px auto;
          padding: 18px;
          background: #eadfcf;
        }
        .page {
          width: 794px;
          min-height: 1123px;
          margin: 0 auto;
          background: var(--paper);
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.18);
        }
        .header {
          min-height: 118px;
          padding: 24px 40px;
          background: linear-gradient(120deg, #55089e -7.06%, #9f0099 16.19%, #ff0080 39.45%, #ef5700 85.96%, #ffff00 109.21%);
          color: #fff;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .header img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          background: transparent;
          flex: 0 0 auto;
        }
        .eyebrow {
          margin: 0 0 8px;
          color: var(--gold);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .title {
          margin: 0;
          font-size: 30px;
          line-height: 1.15;
          font-weight: 700;
        }
        .subtitle {
          margin: 8px 0 0;
          font-size: 13px;
        }
        .body {
          padding: 28px 40px 36px;
        }
        .hero {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 20px;
          margin-bottom: 18px;
        }
        .hero h2 {
          margin: 0;
          font-size: 32px;
          color: var(--ink);
        }
        .hero .invoice-no {
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
        }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }
        .card, .summary, .totals, .qr-card {
          border: 1px solid var(--line);
          border-radius: 10px;
          background: #fff;
        }
        .card {
          padding: 18px;
        }
        .card h3, .summary h3 {
          margin: 0 0 16px;
          font-size: 18px;
          color: var(--ink);
        }
        .kv-row {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 12px;
          margin-bottom: 10px;
          align-items: start;
        }
        .kv-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .kv-value {
          font-size: 14px;
          line-height: 1.45;
        }
        .summary {
          padding: 18px;
          margin-bottom: 18px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        .line-items {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: var(--panel);
          margin-bottom: 18px;
        }
        .line-items th, .line-items td {
          padding: 14px 18px;
          text-align: left;
          border-bottom: 1px solid var(--line);
          font-size: 14px;
        }
        .line-items th {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .line-items td:last-child,
        .line-items th:last-child {
          text-align: right;
        }
        .line-items tr:last-child td {
          border-bottom: 0;
        }
        .bottom {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 18px;
          align-items: start;
        }
        .qr-card {
          padding: 16px;
          text-align: center;
        }
        .qr-card img {
          width: 170px;
          height: 170px;
          display: block;
          margin: 0 auto;
        }
        .totals {
          padding: 18px;
          background: var(--panel);
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 12px 0;
          border-bottom: 1px solid var(--line);
          font-size: 15px;
        }
        .total-row:last-child {
          border-bottom: 0;
          font-weight: 700;
          font-size: 18px;
        }
        .notes {
          margin-top: 16px;
          font-size: 12px;
          line-height: 1.5;
          color: var(--muted);
        }
      </style>
    </head>
    <body>
      <div class="frame">
        <div class="page">
          <div class="header">
            ${
              model.header.logoDataUrl
                ? `<img src="${model.header.logoDataUrl}" alt="TASI logo">`
                : ""
            }
            <div>
              <p class="eyebrow">${escapeHtml(model.header.eyebrow)}</p>
              <h1 class="title">${escapeHtml(model.header.title)}</h1>
              <p class="subtitle">${escapeHtml(model.header.subtitle)}</p>
            </div>
          </div>
          <div class="body">
            <div class="hero">
              <h2>Invoice</h2>
              <div class="invoice-no">${escapeHtml(model.meta.invoiceNumber)}</div>
            </div>

            <div class="two-col">
              <section class="card">
                <h3>Seller Details</h3>
                ${renderRows(sellerRows)}
              </section>
              <section class="card">
                <h3>Billing Details</h3>
                ${renderRows(buyerRows)}
              </section>
            </div>

            <section class="summary">
              <h3>Invoice Summary</h3>
              ${renderRows(metaRows)}
            </section>

            <section class="line-items">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>SAC Code</th>
                    <th>Qty</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${escapeHtml(model.lineItems[0].description)}</td>
                    <td>${escapeHtml(model.lineItems[0].sacCode || "-")}</td>
                    <td>${escapeHtml(model.lineItems[0].quantity)}</td>
                    <td>${escapeHtml(model.lineItems[0].amount)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <div class="bottom">
              <section class="qr-card">
                <img src="${model.qrDataUrl}" alt="Invoice QR">
              </section>

              <section class="totals">
                ${model.totals
                  .map(
                    (row) => `
                      <div class="total-row">
                        <span>${escapeHtml(row.label)}</span>
                        <span>${escapeHtml(row.value)}</span>
                      </div>
                    `,
                  )
                  .join("")}
              </section>
            </div>

            <div class="notes">
              ${model.notes.map((note) => `<div>${escapeHtml(note)}</div>`).join("")}
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

const model = buildFestivalInvoiceDocumentModel({ ticket, user });
model.qrDataUrl = await import("qrcode").then(({ default: QRCode }) =>
  QRCode.toDataURL(model.qrPayload, {
    margin: 1,
    width: 240,
    color: { dark: "#140f26", light: "#FFFFFF" },
  }),
);

const pdfBuffer = await buildFestivalInvoicePdf({ ticket, user });
const html = renderPreview(model);

await writeFile(path.join(process.cwd(), "temp", "invoice-preview.html"), html);
await writeFile(path.join(process.cwd(), "temp", "invoice-preview.pdf"), pdfBuffer);

console.log("WROTE_PREVIEW");
