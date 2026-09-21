import fs from 'node:fs/promises';
import path from 'node:path';

let cachedInlineAttachments = null;

export async function getQrPassEmailInlineAttachments() {
  if (cachedInlineAttachments) {
    return cachedInlineAttachments;
  }

  const imageDirectory = path.join(process.cwd(), 'public', 'img', 'email');
  const [logo, footer] = await Promise.all([
    fs.readFile(path.join(imageDirectory, 'tasi-festival-logo.png')),
    fs.readFile(path.join(imageDirectory, 'tasi-2026-delhi-footer.jpeg')),
  ]);

  cachedInlineAttachments = [
    {
      filename: 'tasi-festival-logo.png',
      content: logo,
      contentId: 'tasi-logo',
    },
    {
      filename: 'tasi-2026-delhi-footer.jpeg',
      content: footer,
      contentId: 'tasi-delhi-footer',
    },
  ];

  return cachedInlineAttachments;
}
