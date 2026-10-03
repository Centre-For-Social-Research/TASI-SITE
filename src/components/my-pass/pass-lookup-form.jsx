'use client';

import { useState } from 'react';
import { ArrowRight, MailCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CONTACT_EMAIL = 'india@trustandsafetyfestival.com';
const PASS_EMAIL_SUBJECT = 'Your TASI 2026 QR entry pass';

const NEXT_STEPS = [
  {
    title: `An email titled “${PASS_EMAIL_SUBJECT}”`,
    note: 'Usually within a couple of minutes. Check spam and promotions too.',
  },
  {
    title: 'The same QR code as before',
    note: 'Any copy of your pass you already have still works.',
  },
  {
    title: 'Show it at the registration desk',
    note: 'We scan the QR code and hand you your badge.',
  },
];

function SentState({ email, onReset }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-xl shadow-stone-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <div className="bg-[linear-gradient(120deg,#1b1035_0%,#3b0e5b_45%,#7a1e63_100%)] px-6 py-8 text-white md:px-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffd919] text-[#350265]">
          <MailCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight md:text-3xl">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80 md:text-base">
          If <span className="break-all font-bold text-[#ffd919]">{email}</span>{' '}
          has a confirmed TASI 2026 registration, your QR pass is on its way to
          that inbox now.
        </p>
      </div>

      <div className="px-6 py-7 md:px-8">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-slate-400">
          What to look for
        </p>
        <ol className="mt-5 space-y-5">
          {NEXT_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#ffd919] text-xs font-black text-[#350265]">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900 dark:text-white">
                  {step.title}
                </p>
                <p className="mt-0.5 text-sm text-stone-600 dark:text-slate-400">
                  {step.note}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-7 flex flex-col gap-3 border-t border-stone-200 pt-5 text-sm dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onReset}
            className="text-left font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
          >
            Try a different email
          </button>
          <p className="text-stone-600 dark:text-slate-400">
            Nothing after 10 minutes?{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
            >
              Email us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PassLookupForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch('/api/my-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus('error');
        setMessage(
          response.status === 429
            ? 'Too many requests from this network. Please try again in a few minutes.'
            : data.error || 'Something went wrong. Please try again.'
        );
        return;
      }

      setStatus('sent');
    } catch {
      setStatus('error');
      setMessage('Could not reach the server. Please check your connection.');
    }
  }

  function reset() {
    setEmail('');
    setStatus('idle');
    setMessage('');
  }

  if (status === 'sent') {
    return <SentState email={email.trim()} onReset={reset} />;
  }

  return (
    <div className="rounded-[10px] border border-stone-200 bg-white shadow-xl shadow-stone-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <form onSubmit={handleSubmit} noValidate className="p-6 md:p-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
          Resend my QR pass
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
          Use the same email address you registered with for TASI 2026.
        </p>
        <label
          htmlFor="pass-lookup-email"
          className="mb-2 mt-6 block text-xs font-black uppercase tracking-[0.12em] text-stone-800 dark:text-slate-200"
        >
          Registered email
        </label>
        <div className="flex flex-col gap-3">
          <Input
            id="pass-lookup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@organisation.com"
            className="h-12 rounded-[10px] border-stone-200 bg-white px-4 text-base text-stone-900 placeholder:text-stone-500"
            required
          />
          <Button
            type="submit"
            disabled={status === 'sending' || !email.trim()}
            className="h-12 rounded-[10px] bg-[#350265] px-6 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-[#2a0150] dark:bg-[#ffd919] dark:text-[#350265] dark:hover:bg-[#ffe34d]"
          >
            {status === 'sending' ? 'Sending…' : 'Send my pass'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {status === 'error' ? (
          <p
            role="alert"
            className="mt-3 text-sm text-red-600 dark:text-red-400"
          >
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
