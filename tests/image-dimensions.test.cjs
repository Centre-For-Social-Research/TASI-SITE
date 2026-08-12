'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function loadValidator() {
  return import(
    pathToFileURL(path.join(process.cwd(), 'src/lib/upload-validation.js')).href
  );
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function buildPng(width, height) {
  const buffer = Buffer.alloc(33);
  Buffer.from(PNG_SIGNATURE).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8); // IHDR chunk length
  buffer.write('IHDR', 12, 'ascii');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

// SOI, an APP0 segment to be skipped, then an SOF0 frame header carrying the
// dimensions. Mirrors the shape of a real JFIF file without the pixel data.
function buildJpeg(width, height, { frameMarker = 0xc0 } = {}) {
  const app0 = Buffer.from([
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00,
    0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  ]);
  const sof = Buffer.alloc(11);
  sof[0] = 0xff;
  sof[1] = frameMarker;
  sof.writeUInt16BE(8, 2); // segment length
  sof[4] = 0x08; // sample precision
  sof.writeUInt16BE(height, 5);
  sof.writeUInt16BE(width, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof]);
}

test('reads PNG dimensions from the IHDR chunk', async () => {
  const { readImageDimensions } = await loadValidator();

  assert.deepEqual(readImageDimensions(buildPng(1200, 630)), {
    type: 'png',
    width: 1200,
    height: 630,
  });
  assert.deepEqual(readImageDimensions(buildPng(1, 1)), {
    type: 'png',
    width: 1,
    height: 1,
  });
});

test('reads JPEG dimensions and skips preceding segments', async () => {
  const { readImageDimensions } = await loadValidator();

  assert.deepEqual(readImageDimensions(buildJpeg(800, 600)), {
    type: 'jpg',
    width: 800,
    height: 600,
  });
});

test('reads JPEG dimensions from progressive frame headers', async () => {
  const { readImageDimensions } = await loadValidator();

  // 0xc2 is progressive JPEG; 0xc1 is extended sequential.
  for (const frameMarker of [0xc1, 0xc2]) {
    assert.deepEqual(
      readImageDimensions(buildJpeg(640, 480, { frameMarker })),
      { type: 'jpg', width: 640, height: 480 },
      `frame marker 0x${frameMarker.toString(16)} should be recognised`
    );
  }
});

test('ignores JPEG markers that are not frame headers', async () => {
  const { readImageDimensions } = await loadValidator();

  // 0xc4 (DHT), 0xc8 (JPG) and 0xcc (DAC) sit inside the SOF numeric range but
  // do not carry dimensions, so they must not be read as a frame header.
  for (const marker of [0xc4, 0xc8, 0xcc]) {
    const result = readImageDimensions(
      buildJpeg(800, 600, {
        frameMarker: marker,
      })
    );
    assert.notDeepEqual(
      result,
      { type: 'jpg', width: 800, height: 600 },
      `marker 0x${marker.toString(16)} must not be treated as a frame header`
    );
  }
});

test('rejects non-image and malformed buffers instead of guessing', async () => {
  const { readImageDimensions } = await loadValidator();

  assert.equal(readImageDimensions(Buffer.from('GIF89a payload')), null);
  assert.equal(
    readImageDimensions(Buffer.from('<script>alert(1)</script>')),
    null
  );
  assert.equal(readImageDimensions(Buffer.alloc(0)), null);
  assert.equal(readImageDimensions(Buffer.from([0xff, 0xd8])), null);
  // PNG signature with the IHDR chunk truncated away.
  assert.equal(readImageDimensions(Buffer.from(PNG_SIGNATURE)), null);
});

test('terminates on adversarial JPEG input rather than looping', async () => {
  const { readImageDimensions } = await loadValidator();

  // A long run of zero-length segments is the shape that makes naive parsers
  // spin forever. This must return promptly instead.
  const hostile = Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    Buffer.alloc(200_000, 0xff),
  ]);

  const startedAt = Date.now();
  const result = readImageDimensions(hostile);
  const elapsedMs = Date.now() - startedAt;

  assert.equal(result, null);
  assert.ok(
    elapsedMs < 1000,
    `parser should bail out quickly, took ${elapsedMs}ms`
  );
});
