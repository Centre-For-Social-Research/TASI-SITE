'use client';

import { useRef, useState } from 'react';
import { FileCheck2, FileWarning, Upload } from 'lucide-react';

// Hashes a PDF in the browser and asks the server whether that fingerprint
// belongs to an issued certificate. The file itself never leaves the device.
async function sha256Hex(file) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    await file.arrayBuffer()
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

export default function CertificateFileCheck({ expectedCode }) {
  const inputRef = useRef(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function check(file) {
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error('That file is too large to be a TASI certificate.');
      const response = await fetch('/api/certificates/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha256: await sha256Hex(file) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error || 'Unable to check the file right now.');
      if (!data.match) {
        setResult({
          ok: false,
          text: 'This file does not match any certificate we issued. It may have been edited, or it is not an original download.',
        });
      } else if (expectedCode && data.code !== expectedCode) {
        setResult({
          ok: false,
          text: `This file is an original, but it belongs to certificate ${data.code}, not ${expectedCode}.`,
        });
      } else if (!data.active) {
        setResult({
          ok: false,
          text: `This file matches certificate ${data.code}, which has been revoked.`,
        });
      } else {
        setResult({
          ok: true,
          text: `Unchanged original. This file matches certificate ${data.code} issued to ${data.name}.`,
        });
      }
    } catch (error) {
      setResult({ ok: false, text: error.message });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="rounded-[10px] border border-dashed border-stone-300 p-5 text-left dark:border-slate-700">
      <p className="text-sm font-bold text-stone-900 dark:text-white">
        Have the PDF? Check it hasn&apos;t been altered.
      </p>
      <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-slate-400">
        The file is checked on your device. Only its digital fingerprint is sent
        to us.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        id="certificate-file"
        onChange={(event) => check(event.target.files?.[0])}
      />
      <label
        htmlFor="certificate-file"
        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <Upload className="h-4 w-4" /> {busy ? 'Checking…' : 'Choose PDF'}
      </label>
      {result ? (
        <p
          role="status"
          className={`mt-4 flex items-start gap-2 text-sm ${result.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {result.ok ? (
            <FileCheck2 className="mt-0.5 h-4 w-4 flex-none" />
          ) : (
            <FileWarning className="mt-0.5 h-4 w-4 flex-none" />
          )}
          {result.text}
        </p>
      ) : null}
    </div>
  );
}
