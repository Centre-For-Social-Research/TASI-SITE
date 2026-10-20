'use client';

import { useState } from 'react';
import {
  Check,
  Download,
  ExternalLink,
  Linkedin,
  Pencil,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BUTTON =
  'h-12 rounded-[10px] px-6 text-xs font-black uppercase tracking-[0.14em]';

export default function CertificateClaim({
  token,
  code,
  initialName,
  initialChangesLeft,
  linkedInUrl,
  verifyUrl,
}) {
  const [name, setName] = useState(initialName);
  const [draft, setDraft] = useState(initialName);
  const [changesLeft, setChangesLeft] = useState(initialChangesLeft);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function saveName(event) {
    event.preventDefault();
    if (draft.trim() === name) {
      setEditing(false);
      return;
    }
    if (
      !window.confirm(
        `Change the name on your certificate to “${draft.trim()}”? You have ${changesLeft} change${changesLeft === 1 ? '' : 's'} left.`
      )
    )
      return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/certificates/${encodeURIComponent(token)}/name`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: draft }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? 'Too many attempts. Please try again in a few minutes.'
            : data.error || 'Could not update the name.'
        );
      setName(data.name);
      setDraft(data.name);
      setChangesLeft(data.changesLeft);
      setEditing(false);
      setMessage({
        ok: true,
        text: 'Name updated. Download your certificate again to get the new version.',
      });
    } catch (error) {
      setMessage({ ok: false, text: error.message });
    } finally {
      setSaving(false);
    }
  }

  const pdfUrl = `/api/certificates/${encodeURIComponent(token)}/pdf`;

  return (
    <div className="rounded-[10px] border border-stone-200 bg-white shadow-xl shadow-stone-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <div className="p-6 md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-slate-400">
          Name on your certificate
        </p>
        {editing ? (
          <form onSubmit={saveName} className="mt-3 flex flex-col gap-3">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={80}
              autoFocus
              aria-label="Your name as it should appear"
              className="h-12 rounded-[10px] border-stone-200 bg-white px-4 text-lg text-stone-900"
            />
            <p className="text-xs text-stone-500 dark:text-slate-400">
              Use English letters; accents are fine. {changesLeft} change
              {changesLeft === 1 ? '' : 's'} left.
            </p>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving || draft.trim().length < 2}
                className={`${BUTTON} bg-[#350265] text-white hover:bg-[#2a0150]`}
              >
                {saving ? 'Saving…' : 'Save name'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setDraft(name);
                }}
                className={BUTTON}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="font-serif text-3xl font-bold text-[#022d5d] dark:text-white">
              {name}
            </p>
            {changesLeft > 0 ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
              >
                <Pencil className="h-4 w-4" /> Fix spelling
              </button>
            ) : (
              <p className="text-xs text-stone-500 dark:text-slate-400">
                Need another change? Write to tasi.comms@csrindia.org.
              </p>
            )}
          </div>
        )}
        {message ? (
          <p
            role="status"
            className={`mt-3 text-sm ${message.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {message.ok ? <Check className="mr-1 inline h-4 w-4" /> : null}
            {message.text}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href={pdfUrl}
            className={`${BUTTON} inline-flex items-center justify-center gap-2 bg-[#350265] text-white hover:bg-[#2a0150]`}
          >
            <Download className="h-4 w-4" /> Download PDF
          </a>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON} inline-flex items-center justify-center gap-2 border border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/5`}
          >
            <Linkedin className="h-4 w-4" /> Add to LinkedIn
          </a>
        </div>

        <div className="mt-7 flex items-start gap-3 border-t border-stone-200 pt-5 text-sm text-stone-600 dark:border-slate-800 dark:text-slate-400">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-[#350265] dark:text-amber-300" />
          <p>
            Certificate ID{' '}
            <span className="font-mono font-bold text-stone-900 dark:text-white">
              {code}
            </span>
            . Anyone can check it is genuine at{' '}
            <a
              href={verifyUrl}
              className="inline-flex items-center gap-1 font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
            >
              the verification page <ExternalLink className="h-3.5 w-3.5" />
            </a>
            . This page is private to you, so please don&apos;t share its link.
          </p>
        </div>
      </div>
    </div>
  );
}
