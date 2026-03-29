import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { EVENT_CONFIG } from "@/lib/registration-constants";
import badgeLayoutUtils from "@/lib/registration-badge-layout.cjs";
import { buildBadgeDisplayName, PROFILE_BUCKET } from "@/lib/registration-utils";

const { getBadgeTierTheme, normalizeBadgeSingleLine } = badgeLayoutUtils;

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

export async function buildQrPngBuffer(token) {
  return QRCode.toBuffer(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 720,
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  });
}

async function bufferToDataUrl(buffer, mimeType) {
  return `data:${mimeType};base64,${Buffer.from(buffer).toString("base64")}`;
}

function getMimeTypeFromPhotoPath(photoPath) {
  const extension = path.extname(String(photoPath || "")).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  return "image/png";
}

async function getBadgePhotoDataUrl(registration) {
  const photoPath = String(registration?.profile_photo_path || "").trim();

  if (!photoPath) {
    return null;
  }

  try {
    const supabase = getSupabaseAdmin();
    const downloadResult = await supabase.storage.from(PROFILE_BUCKET).download(photoPath);

    if (downloadResult.error || !downloadResult.data) {
      return null;
    }

    const arrayBuffer = await downloadResult.data.arrayBuffer();
    return bufferToDataUrl(Buffer.from(arrayBuffer), getMimeTypeFromPhotoPath(photoPath));
  } catch {
    return null;
  }
}

function getImageFormatFromDataUrl(dataUrl, fallback = "PNG") {
  if (typeof dataUrl !== "string") {
    return fallback;
  }

  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) {
    return "JPEG";
  }

  if (dataUrl.startsWith("data:image/png")) {
    return "PNG";
  }

  return fallback;
}

function formatEventDateRange() {
  const start = new Date(`${EVENT_CONFIG.startDate}T00:00:00+05:30`);
  const end = new Date(`${EVENT_CONFIG.endDate}T00:00:00+05:30`);
  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startLabel = formatter.format(start);
  const endLabel = formatter.format(end);

  if (startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel} - ${endLabel}`;
}

function drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, photoDataUrl, headerLabel) {
  const displayName = buildBadgeDisplayName(registration);
  const badgeLabel = registration.badge_color_label || "Delegate";
  const tierTheme = getBadgeTierTheme({
    badgeColorHex: registration.badge_color_hex,
    badgeColorLabel: badgeLabel,
  });
  const organizationLine = normalizeBadgeSingleLine(registration.organization || "", 30);
  const attendeeLines = doc.splitTextToSize(displayName || "", 54);
  const categoryLabel = registration.attendee_category || "Delegate";
  const eventDatesLabel = "13-14 Oct 2026";
  const compactHeaderLabel = normalizeBadgeSingleLine(headerLabel, 24);
  const policyRules = [
    "Carry a valid government-issued photo ID.",
    "Badge is valid only for the registered attendee.",
    "Security and venue instructions must be followed at all times.",
  ];

  doc.setFillColor(250, 248, 242);
  doc.rect(0, 0, 101.6, 152.4, "F");

  doc.setFillColor(24, 30, 58);
  doc.rect(0, 0, 101.6, 29.5, "F");
  doc.setFillColor(201, 144, 44);
  doc.rect(0, 29.5, 101.6, 1.8, "F");

  doc.addImage(logoDataUrl, "PNG", 7, 7, 25, 10.6, undefined, "FAST");
  doc.setDrawColor(78, 89, 130);
  doc.setLineWidth(0.5);
  doc.line(34.7, 4, 34.7, 24.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.8);
  doc.text("Trust & Safety India Festival", 39, 11.2);
  doc.setTextColor(214, 171, 65);
  doc.setFontSize(7.6);
  doc.text("TASI 2026", 39, 16.9);
  doc.text("13-14 October 2026", 58.3, 16.9);
  doc.setTextColor(235, 239, 247);
  doc.setFontSize(7.8);
  doc.text("New Delhi, India", 39, 22.8);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(71.5, 18.4, 25.4, 7.6, 2.2, 2.2, "F");
  doc.setTextColor(...tierTheme.fillColor);
  doc.setFontSize(4.95);
  doc.text(compactHeaderLabel, 84.2, 23.15, { align: "center", maxWidth: 23 });

  doc.setTextColor(101, 115, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("ATTENDEE", 8, 39.5);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17.8);
  doc.text(attendeeLines, 8, 48.8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  doc.text(organizationLine || "-", 8, 57.6, { maxWidth: 60 });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(15, 23, 42);
  doc.rect(73.2, 36.3, 20.8, 20.8, "FD");
  if (photoDataUrl) {
    doc.addImage(photoDataUrl, getImageFormatFromDataUrl(photoDataUrl, "JPEG"), 73.9, 37, 19.4, 19.4, undefined, "FAST");
  } else {
    doc.setFillColor(201, 144, 44);
    doc.circle(83.6, 43.8, 3.4, "F");
    doc.setFillColor(38, 71, 130);
    doc.circle(83.6, 50.4, 5.8, "F");
  }

  doc.setFillColor(...tierTheme.fillColor);
  doc.roundedRect(8, 64.2, 84.2, 7.5, 2.4, 2.4, "F");
  doc.setFillColor(...tierTheme.dotColor);
  doc.circle(12.4, 67.95, 1.35, "F");
  doc.setTextColor(...tierTheme.textColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.1);
  doc.text(tierTheme.label, 16, 68.7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.text(categoryLabel, 84.5, 68.7, { align: "right" });

  doc.setDrawColor(224, 228, 235);
  doc.setLineWidth(0.35);
  doc.line(8, 76.8, 93.6, 76.8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text("REG. ID", 8, 82.8);
  doc.text("CATEGORY", 41.5, 82.8);
  doc.text("DATES", 78.5, 82.8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(registration.registration_code || "-", 8, 87.8, { maxWidth: 33 });
  doc.text(categoryLabel, 41.5, 87.8, { maxWidth: 18 });
  doc.text(eventDatesLabel, 78.5, 87.8, { align: "center", maxWidth: 24 });

  doc.setDrawColor(224, 228, 235);
  doc.line(8, 91.3, 93.6, 91.3);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("ENTRY PASS", 8, 97.4);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.9);
  doc.text("Scan to verify", 8, 105.3);
  doc.setDrawColor(201, 144, 44);
  doc.setLineWidth(0.7);
  doc.line(8, 108.8, 30.2, 108.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(5.9);
  doc.text("Show this pass with", 8, 114.7);
  doc.text("a valid photo ID at", 8, 120.1);
  doc.text("the venue entrance.", 8, 125.5);

  doc.setTextColor(201, 144, 44);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.1);
  doc.text("Policy rules", 8, 133.4);
  doc.setTextColor(88, 102, 122);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.7);
  doc.text(`- ${policyRules[0]}`, 8, 138.1, { maxWidth: 42 });
  doc.text(`- ${policyRules[1]}`, 8, 142.4, { maxWidth: 42 });
  doc.text(`- ${policyRules[2]}`, 8, 146.7, { maxWidth: 42 });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 224, 232);
  doc.setLineWidth(0.7);
  doc.roundedRect(60, 96.2, 32.5, 32.5, 2.8, 2.8, "FD");
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", 62, 98.2, 28.2, 28.2, undefined, "FAST");
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("QR pass not", 76.5, 111.7, { align: "center" });
    doc.text("issued yet", 76.5, 116.7, { align: "center" });
  }

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.6);
  doc.text(registration.registration_code || "-", 76.5, 131.6, { align: "center" });

  doc.setFillColor(...tierTheme.fillColor);
  doc.rect(0, 147.6, 101.6, 4.8, "F");
  doc.setFillColor(201, 144, 44);
  doc.rect(0, 147.6, 2.6, 4.8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.6);
  doc.text("Organised by Centre for Social Research • Trust and Safety Festival", 50.8, 150.6, {
    align: "center",
  });
}

export async function buildPassAttachment({ token, registration }) {
  const qrDataUrl = await buildQrDataUrl(token);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [152.4, 101.6],
  });
  const logoDataUrl = await getBadgeLogoDataUrl();
  const photoDataUrl = await getBadgePhotoDataUrl(registration);
  drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, photoDataUrl, "OFFICIAL CREDENTIAL");

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
    const qrDataUrl = registration.qr_token ? await buildQrDataUrl(registration.qr_token) : null;
    const photoDataUrl = await getBadgePhotoDataUrl(registration);

    if (index > 0) {
      doc.addPage([152.4, 101.6], "portrait");
    }
    drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, photoDataUrl, "BADGE EXPORT PROOF");
  }

  return Buffer.from(doc.output("arraybuffer"));
}
