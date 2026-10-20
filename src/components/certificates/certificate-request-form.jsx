'use client';

import { useState } from 'react';
import { ArrowRight, MailCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CertificateRequestForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const response = await fetch('/api/certificates/request', {
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
      setMessage(data.message);
    } catch {
      setStatus('error');
      setMessage('Could not reach the server. Please check your connection.');
    }
  }

  return (
    <div className="rounded-[10px] border border-stone-200 bg-white shadow-xl shadow-stone-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      {status === 'sent' ? (
        <div className="p-6 md:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffd919] text-[#350265]">
            <MailCheck className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            Check your inbox
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
            {message}
          </p>
          <p className="mt-4 text-sm text-stone-600 dark:text-slate-400">
            Attended but nothing arrives? Write to{' '}
            <a
              href="mailto:tasi.comms@csrindia.org"
              className="font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
            >
              tasi.comms@csrindia.org
            </a>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="p-6 md:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            Send me my certificate link
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
            Use the email you registered with for TASI 2026.
          </p>
          <label
            htmlFor="certificate-email"
            className="mb-2 mt-6 block text-xs font-black uppercase tracking-[0.12em] text-stone-800 dark:text-slate-200"
          >
            Registered email
          </label>
          <div className="flex flex-col gap-3">
            <Input
              id="certificate-email"
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
              className="h-12 rounded-[10px] bg-[#350265] px-6 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-[#2a0150]"
            >
              {status === 'sending' ? 'Sending…' : 'Send my link'}
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
      )}
    </div>
  );
}
