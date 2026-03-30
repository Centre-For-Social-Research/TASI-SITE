'use client';

import { useState } from 'react';

export default function ConfirmationEmailFlow() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register/confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || 'Unable to submit confirmation request.');
      } else {
        setStatus(
          'Confirmation request received. Our team will send your registration confirmation email shortly.'
        );
        setEmail('');
      }
    } catch {
      setStatus('Network error. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
      <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">
        Confirmation Email Flow
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        After you submit the registration form, a confirmation email should
        arrive shortly. If you do not receive it, submit your email below and we
        will resend confirmation support.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label htmlFor="confirmation-email" className="sr-only">
          Email address
        </label>
        <input
          id="confirmation-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your registration email"
          className="h-11 flex-1 rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none ring-orange-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-md bg-orange-700 px-5 text-sm font-semibold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Submitting...' : 'Request Confirmation'}
        </button>
      </form>

      {status ? (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
          {status}
        </p>
      ) : null}
    </section>
  );
}
