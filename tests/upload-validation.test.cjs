'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

async function importModule(relativePath) {
  return import(pathToFileURL(path.join(process.cwd(), relativePath)).href);
}

test('upload validator accepts only JPEG and PNG magic bytes', async () => {
  const { sniffImageMimeType } = await importModule(
    'src/lib/upload-validation.js'
  );

  assert.equal(
    sniffImageMimeType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])),
    'image/jpeg'
  );
  assert.equal(
    sniffImageMimeType(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    ),
    'image/png'
  );
  assert.equal(
    sniffImageMimeType(Buffer.from('GIF89a malicious payload')),
    null
  );
  assert.equal(
    sniffImageMimeType(Buffer.from('<script>alert(1)</script>')),
    null
  );
});

test('upload validator rejects unsupported extensions and GIF content in source', () => {
  const source = read('src/lib/upload-validation.js');

  assert.match(
    source,
    /ALLOWED_IMAGE_EXTENSIONS = new Set\(\['jpg', 'jpeg', 'png'\]\)/
  );
  assert.match(
    source,
    /ALLOWED_IMAGE_MIME_TYPES = new Set\(\['image\/jpeg', 'image\/png'\]\)/
  );
  assert.match(source, /sniffImageMimeType\(buffer\)/);
  assert.match(source, /file type does not match its contents/);
  assert.doesNotMatch(source, /image\/gif/);
});

test('public upload endpoints use shared multipart upload validation', () => {
  const registrationRoute = read('src/app/api/registrations/create/route.js');
  const ticketRoute = read('src/app/api/tickets/upload-photo/route.js');

  for (const route of [registrationRoute, ticketRoute]) {
    assert.match(route, /protectPublicMultipartPostRoute/);
    assert.match(route, /validateUploadedImageFile/);
    assert.doesNotMatch(route, /imageSize\(buffer\)/);
    assert.doesNotMatch(route, /ACCEPTED_MIME_TYPES/);
  }

  assert.match(registrationRoute, /UploadValidationError/);
  assert.doesNotMatch(ticketRoute, /protectPublicPostRoute/);
});

test('multipart protection is separate from JSON-only protection', () => {
  const source = read('src/lib/api-security.js');

  assert.match(source, /function enforceMultipartRequest\(request\)/);
  assert.match(source, /multipart\/form-data/);
  assert.match(source, /function enforceJsonRequest\(request\)/);
  assert.match(source, /export async function protectPublicMultipartPostRoute/);
});

test('public upload form inputs advertise the same JPEG and PNG allowlist', () => {
  const registrationForm = read(
    'src/components/register/registration-form.jsx'
  );
  const ticketingSection = read(
    'src/components/register/festival-ticketing-section.jsx'
  );

  for (const source of [registrationForm, ticketingSection]) {
    assert.match(source, /image\/jpeg,image\/png/);
    assert.match(source, /jpg', 'jpeg', 'png/);
  }
});
