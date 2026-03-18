const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;
const MULTISPACE_REGEX = /\s+/g;
const HTML_TAG_REGEX = /<[^>]*>/g;

const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(CONTROL_CHARS_REGEX, " ")
    .trim();
}

export function sanitizeEmail(value) {
  const normalized = normalizeText(value).toLowerCase();
  return normalized.replace(MULTISPACE_REGEX, "");
}

export function isValidEmail(email) {
  if (!email || email.length > 320 || !BASIC_EMAIL_REGEX.test(email)) {
    return false;
  }

  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) {
    return false;
  }

  if (localPart.length > 64 || domainPart.length > 255) {
    return false;
  }

  if (domainPart.startsWith(".") || domainPart.endsWith(".")) {
    return false;
  }

  return true;
}

export function sanitizeMessage(value) {
  const normalized = normalizeText(value)
    .replace(/\r\n?/g, "\n")
    .replace(HTML_TAG_REGEX, "")
    .replace(/\n{3,}/g, "\n\n");

  return normalized;
}
