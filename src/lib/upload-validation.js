import path from 'node:path';
import { imageSize } from 'image-size';

const IMAGE_MIME_BY_TYPE = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

const EXTENSION_BY_TYPE = {
  jpg: 'jpg',
  jpeg: 'jpg',
  png: 'png',
};

const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

export class UploadValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UploadValidationError';
  }
}

function getExtensionFromName(fileName) {
  return path
    .extname(String(fileName || ''))
    .replace('.', '')
    .toLowerCase();
}

function formatMaxBytes(maxBytes) {
  if (maxBytes >= 1024 * 1024 && maxBytes % (1024 * 1024) === 0) {
    return `${maxBytes / (1024 * 1024)} MB`;
  }

  if (maxBytes >= 1024 && maxBytes % 1024 === 0) {
    return `${maxBytes / 1024}KB`;
  }

  return `${maxBytes} bytes`;
}

function fail(message) {
  throw new UploadValidationError(message);
}

export function sniffImageMimeType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 8) {
    return null;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  return null;
}

export async function validateUploadedImageFile(
  file,
  {
    fieldName = 'Image',
    maxBytes,
    minWidth = 1,
    minHeight = 1,
    allowedMimeTypes = ALLOWED_IMAGE_MIME_TYPES,
    allowedExtensions = ALLOWED_IMAGE_EXTENSIONS,
  } = {}
) {
  if (!(file instanceof File) || !file.size) {
    fail(`${fieldName} is required.`);
  }

  if (maxBytes && file.size > maxBytes) {
    fail(`${fieldName} must be ${formatMaxBytes(maxBytes)} or smaller.`);
  }

  const declaredType = String(file.type || '').toLowerCase();
  if (!allowedMimeTypes.has(declaredType)) {
    fail(`${fieldName} must be a JPG, JPEG, or PNG file.`);
  }

  const declaredExtension = getExtensionFromName(file.name);
  if (!declaredExtension || !allowedExtensions.has(declaredExtension)) {
    fail(`${fieldName} filename must end in .jpg, .jpeg, or .png.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffedMimeType = sniffImageMimeType(buffer);

  if (!sniffedMimeType || !allowedMimeTypes.has(sniffedMimeType)) {
    fail(`${fieldName} content must be a valid JPG or PNG image.`);
  }

  if (sniffedMimeType !== declaredType) {
    fail(`${fieldName} file type does not match its contents.`);
  }

  let dimensions;
  try {
    dimensions = imageSize(buffer);
  } catch {
    fail(`${fieldName} content must be a readable image.`);
  }

  const detectedType = String(dimensions.type || '').toLowerCase();
  const detectedMimeType = IMAGE_MIME_BY_TYPE[detectedType] || null;
  if (detectedMimeType !== sniffedMimeType) {
    fail(`${fieldName} content must be a valid JPG or PNG image.`);
  }

  if (
    !dimensions.width ||
    !dimensions.height ||
    dimensions.width < minWidth ||
    dimensions.height < minHeight
  ) {
    fail(`${fieldName} must be at least ${minWidth} x ${minHeight} pixels.`);
  }

  return {
    buffer,
    contentType: sniffedMimeType,
    extension: EXTENSION_BY_TYPE[detectedType],
    dimensions,
    sizeBytes: file.size,
  };
}
