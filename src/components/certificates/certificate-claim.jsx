'use client';

import { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Linkedin,
  Lock,
  Mail,
  Pencil,
  ShieldCheck,
  Twitter,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CertificatePreview from '@/components/certificates/certificate-preview';

const STEPS = [
  { key: 'verify', label: 'Verify email' },
  { key: 'confirm', label: 'Confirm name' },
  { key: 'ready', label: 'Download & share' },
];
const BTN =
  'h-12 rounded-[10px] px-6 text-xs font-black uppercase tracking-[0.14em]';
const PRIMARY = `${BTN} bg-[#350265] text-white hover:bg-[#2a0150]`;

async function post(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      response.status === 429 && !data.error
        ? 'Too many attempts. Please wait a few minutes.'
        : data.error || 'Something went wrong.'
    );
  }
  return data;
}

function Stepper({ step }) {
  const current = STEPS.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2 border-b border-stone-200 px-6 py-4 dark:border-slate-800 md:px-8">
      {STEPS.map((s, index) => (
        <li key={s.key} className="flex flex-1 items-center gap-2">
          <span
            className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-black ${
              index < current
                ? 'bg-emerald-600 text-white'
                : index === current
                  ? 'bg-[#350265] text-white'
                  : 'bg-stone-200 text-stone-500 dark:bg-slate-800'
            }`}
          >
            {index < current ? <Check className="h-4 w-4" /> : index + 1}
          </span>
          <span
            className={`hidden text-xs font-bold sm:block ${index === current ? 'text-stone-900 dark:text-white' : 'text-stone-500'}`}
          >
            {s.label}
          </span>
          {index < STEPS.length - 1 ? (
            <span className="h-px flex-1 bg-stone-200 dark:bg-slate-800" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export default function CertificateClaim({
  token,
  code,
  maskedEmail,
  initialStep,
  initialCode = '',
  initialName,
  initialChangesLeft,
  issuedOn,
  linkedInAddUrl,
  verifyUrl,
}) {
  const [step, setStep] = useState(initialStep);
  const [name, setName] = useState(initialName);
  const [draft, setDraft] = useState(initialName);
  const [changesLeft, setChangesLeft] = useState(initialChangesLeft);
  const [editing, setEditing] = useState(false);
  // A code arriving in the link (from the code email) is filled in; the
  // attendee still taps Verify, so a link scanner opening it uses nothing.
  const [codeSent, setCodeSent] = useState(Boolean(initialCode));
  const [codeInput, setCodeInput] = useState(initialCode);
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState(
    initialCode
      ? { ok: true, text: 'Your code is filled in. Tap Verify to continue.' }
      : null
  );
  const [copied, setCopied] = useState(false);
  const base = `/api/certificates/${encodeURIComponent(token)}`;

  async function run(key, fn) {
    setBusy(key);
    setMessage(null);
    try {
      await fn();
    } catch (error) {
      setMessage({ ok: false, text: error.message });
    } finally {
      setBusy('');
    }
  }

  const sendCode = () =>
    run('code', async () => {
      await post(`${base}/code`);
      setCodeSent(true);
      setMessage({
        ok: true,
        text: `We sent a 6-digit code to ${maskedEmail}. Enter it below, or tap the link in that email. It works for 10 minutes.`,
      });
    });

  const verifyCode = (event) => {
    event.preventDefault();
    return run('verify', async () => {
      await post(`${base}/session`, { code: codeInput });
      setStep('confirm');
    });
  };

  const saveName = (event) => {
    event.preventDefault();
    return run('name', async () => {
      const data = await post(`${base}/name`, { name: draft });
      setName(data.name);
      setDraft(data.name);
      setChangesLeft(data.changesLeft);
      setEditing(false);
    });
  };

  const confirmName = () =>
    run('confirm', async () => {
      await post(`${base}/name`, { action: 'confirm' });
      setStep('ready');
    });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const shareText =
    'I took part in the Trust & Safety India Festival 2026 (#TASI2026) in New Delhi, organised by the Centre for Social Research. Certificate:';
  const linkedInPostUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(verifyUrl)}`;

  return (
    <div className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-xl shadow-stone-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <Stepper step={step} />
      <div className="p-6 md:p-8">
        {step === 'verify' ? (
          <div>
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 flex-none text-[#350265] dark:text-amber-300" />
              <div>
                <h2 className="text-xl font-extrabold text-stone-900 dark:text-white">
                  First, let&apos;s check it&apos;s you
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                  We&apos;ll email a one-time code to{' '}
                  <b className="text-stone-900 dark:text-white">
                    {maskedEmail}
                  </b>
                  , the address your certificate was issued to.
                </p>
              </div>
            </div>
            {codeSent ? (
              <form
                onSubmit={verifyCode}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  value={codeInput}
                  onChange={(event) =>
                    setCodeInput(
                      event.target.value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  aria-label="6-digit code"
                  className="h-12 flex-1 rounded-[10px] border-stone-200 bg-white px-4 text-center font-mono text-xl tracking-[0.4em] text-stone-900"
                />
                <Button
                  type="submit"
                  disabled={busy === 'verify' || codeInput.length !== 6}
                  className={PRIMARY}
                >
                  {busy === 'verify' ? 'Checking…' : 'Verify'}
                </Button>
              </form>
            ) : null}
            <div className="mt-4">
              <Button
                type="button"
                onClick={sendCode}
                disabled={busy === 'code'}
                className={
                  codeSent
                    ? `${BTN} border border-stone-300 bg-white text-stone-700 hover:bg-stone-50`
                    : PRIMARY
                }
              >
                {busy === 'code'
                  ? 'Sending…'
                  : codeSent
                    ? 'Send a new code'
                    : 'Email me a code'}
              </Button>
            </div>
          </div>
        ) : null}

        {step === 'confirm' ? (
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-white">
              Is your name right?
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
              This is exactly how it will appear. Once you confirm, the name is
              locked.
            </p>
            <div className="mt-5">
              <CertificatePreview name={name} code={code} issuedOn={issuedOn} />
            </div>
            {editing ? (
              <form onSubmit={saveName} className="mt-5 flex flex-col gap-3">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={80}
                  autoFocus
                  aria-label="Your name"
                  className="h-12 rounded-[10px] border-stone-200 bg-white px-4 text-lg text-stone-900"
                />
                <p className="text-xs text-stone-500 dark:text-slate-400">
                  Use English letters; accents are fine. {changesLeft} edit
                  {changesLeft === 1 ? '' : 's'} left.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={busy === 'name' || draft.trim().length < 2}
                    className={PRIMARY}
                  >
                    {busy === 'name' ? 'Saving…' : 'Update preview'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={BTN}
                    onClick={() => {
                      setEditing(false);
                      setDraft(name);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-4">
                {changesLeft > 0 ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
                  >
                    <Pencil className="h-4 w-4" /> Fix the spelling of my name
                  </button>
                ) : null}
                <label className="flex items-start gap-3 text-sm text-stone-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={understood}
                    onChange={(event) => setUnderstood(event.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span>
                    My name is correct. I understand it will be locked after I
                    confirm.
                  </span>
                </label>
                <Button
                  type="button"
                  onClick={confirmName}
                  disabled={!understood || busy === 'confirm'}
                  className={PRIMARY}
                >
                  <Lock className="mr-2 h-4 w-4" />{' '}
                  {busy === 'confirm' ? 'Confirming…' : 'Confirm my name'}
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {step === 'ready' ? (
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" /> Verified and ready
            </div>
            <div className="mt-4">
              <CertificatePreview name={name} code={code} issuedOn={issuedOn} />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={`${base}/pdf`}
                className={`${PRIMARY} inline-flex items-center justify-center gap-2`}
              >
                <Download className="h-4 w-4" /> Download PDF
              </a>
              <a
                href={linkedInAddUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN} inline-flex items-center justify-center gap-2 bg-[#0a66c2] text-white hover:bg-[#08559f]`}
              >
                <Linkedin className="h-4 w-4" /> Add to LinkedIn profile
              </a>
            </div>
            <p className="mt-6 text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-slate-400">
              Share your certificate
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={linkedInPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200"
              >
                <Linkedin className="h-4 w-4" /> Post on LinkedIn
              </a>
              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200"
              >
                <Twitter className="h-4 w-4" /> Post on X
              </a>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}{' '}
                {copied ? 'Copied' : 'Copy verification link'}
              </button>
            </div>
            <p className="mt-6 border-t border-stone-200 pt-5 text-sm leading-relaxed text-stone-600 dark:border-slate-800 dark:text-slate-400">
              Your certificate ID is{' '}
              <span className="font-mono font-bold text-stone-900 dark:text-white">
                {code}
              </span>
              . Anyone can confirm it is genuine with the verification link. The
              name is locked; if it needs changing, write to
              tasi.comms@csrindia.org.
            </p>
          </div>
        ) : null}

        {message ? (
          <p
            role={message.ok ? 'status' : 'alert'}
            className={`mt-4 text-sm ${message.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
