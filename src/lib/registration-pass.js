import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { EVENT_CONFIG } from "@/lib/registration-constants";
import { buildBadgeDisplayName } from "@/lib/registration-utils";

let cachedLogoDataUrl = null;

async function fileToDataUrl(filePath, mimeType) {
  const buffer = await fs.readFile(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function getBadgeLogoDataUrl() {
  if (cachedLogoDataUrl) {
    return cachedLogoDataUrl;
  }

  const customLogoPath = process.env.BADGE_LOGO_FILE_PATH?.trim();
  const fallbackPath = path.join(process.cwd(), "public", "img", "tasi-csr-logo.png");
  const logoPath = customLogoPath || fallbackPath;
  const extension = path.extname(logoPath).toLowerCase();
  const mimeType = extension === ".jpg" || extension === ".jpeg" ? "image/jpeg" : "image/png";
  cachedLogoDataUrl = await fileToDataUrl(logoPath, mimeType);
  return cachedLogoDataUrl;
}

export async function buildQrDataUrl(token) {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  });
}

export async function buildPassAttachment({ token, registration }) {
  const qrDataUrl = await buildQrDataUrl(token);
  const badgeColor = registration.badge_color_hex || "#173B7A";
  const badgeLabel = registration.badge_color_label || "Delegate";
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [152.4, 101.6],
  });
  const logoDataUrl = await getBadgeLogoDataUrl();
  const displayName = buildBadgeDisplayName(registration);

  doc.setFillColor(248, 245, 239);
  doc.rect(0, 0, 101.6, 152.4, "F");

  doc.setFillColor(badgeColor);
  doc.rect(0, 0, 101.6, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(EVENT_CONFIG.shortName, 8, 11);
  doc.setFontSize(9);
  doc.text("Approved attendee badge", 8, 15);

  doc.addImage(logoDataUrl, "PNG", 64, 6, 30, 10, undefined, "FAST");

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(22);
  doc.text(displayName, 8, 34, { maxWidth: 58 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(registration.organization || "", 8, 49, { maxWidth: 58 });
  doc.setFontSize(10);
  doc.text(registration.attendee_category, 8, 58);
  doc.setTextColor(75, 85, 99);
  doc.text(`Registration ID: ${registration.registration_code}`, 8, 66);
  doc.text(`Badge label: ${badgeLabel}`, 8, 72);

  doc.addImage(qrDataUrl, "PNG", 58, 42, 34, 34, undefined, "FAST");
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.text("Present this QR with a valid government-issued ID", 8, 84, { maxWidth: 84 });
  doc.text("Name-sorted badge collection desk", 8, 90);
  doc.text(`${EVENT_CONFIG.startDate} to ${EVENT_CONFIG.endDate}`, 8, 96);

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return {
    qrDataUrl,
    pdfBuffer,
    filename: `${registration.registration_code}-badge.pdf`,
  };
}

export function buildBadgeExportRows(registrations) {
  return registrations.map((registration) => ({
    registration_id: registration.id,
    registration_code: registration.registration_code,
    first_name: registration.first_name,
    last_name: registration.last_name,
    badge_display_name: buildBadgeDisplayName(registration),
    organization: registration.organization,
    category: registration.attendee_category,
    badge_color: registration.badge_color_label,
    badge_color_hex: registration.badge_color_hex,
    qr_token: registration.qr_token || "",
    status: registration.status,
    issue_date: registration.qr_pass_issued_at || "",
    print_batch_id: registration.last_badge_export_batch_id || "",
    exception_badge_required: registration.exception_badge_required ? "Yes" : "No",
  }));
}

export function buildCsvExport(rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  return XLSX.utils.sheet_to_csv(worksheet);
}

export function buildExcelExport(rows) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Badges");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export async function buildPdfMergeExport(registrations) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [152.4, 101.6],
  });
  const logoDataUrl = await getBadgeLogoDataUrl();

  for (let index = 0; index < registrations.length; index += 1) {
    const registration = registrations[index];
    const displayName = buildBadgeDisplayName(registration);
    const qrDataUrl = registration.qr_token ? await buildQrDataUrl(registration.qr_token) : null;

    if (index > 0) {
      doc.addPage([152.4, 101.6], "portrait");
    }

    doc.setFillColor(248, 245, 239);
    doc.rect(0, 0, 101.6, 152.4, "F");
    doc.setFillColor(registration.badge_color_hex || "#173B7A");
    doc.rect(0, 0, 101.6, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(EVENT_CONFIG.shortName, 8, 11);
    doc.setFontSize(9);
    doc.text("Badge export proof", 8, 15);
    doc.addImage(logoDataUrl, "PNG", 64, 6, 30, 10, undefined, "FAST");

    doc.setTextColor(17, 24, 39);
    doc.setFontSize(22);
    doc.text(displayName, 8, 34, { maxWidth: 58 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(registration.organization || "", 8, 49, { maxWidth: 58 });
    doc.setFontSize(10);
    doc.text(registration.attendee_category, 8, 58);
    doc.setTextColor(75, 85, 99);
    doc.text(`Registration ID: ${registration.registration_code}`, 8, 66);
    doc.text(`Badge label: ${registration.badge_color_label}`, 8, 72);
    doc.text(registration.exception_badge_required ? "Exception badge required" : "Main print batch", 8, 78);

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 58, 42, 34, 34, undefined, "FAST");
    }
  }

  return Buffer.from(doc.output("arraybuffer"));
}
