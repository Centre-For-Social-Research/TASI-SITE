'use client';

import { useState } from 'react';

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organization: '',
  city: '',
  availability: '',
  interestArea: '',
  motivation: '',
};

export default function VolunteerApplicationForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/volunteer-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error || 'Unable to submit your volunteer application.'
        );
      }

      setFormData(initialFormState);
      setStatus({
        type: 'success',
        message:
          'Volunteer interest received. The TASI team will review it and reach out with next steps.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to submit your volunteer application.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    'w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-orange-400 dark:focus:bg-slate-900 dark:focus:ring-orange-500/20';

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col rounded-[2rem] border border-stone-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            First Name
          </span>
          <input
            className={inputClassName}
            name="firstName"
            value={formData.firstName}
            onChange={updateField}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            Last Name
          </span>
          <input
            className={inputClassName}
            name="lastName"
            value={formData.lastName}
            onChange={updateField}
            required
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            Contact Email
          </span>
          <input
            className={inputClassName}
            type="email"
            name="email"
            value={formData.email}
            onChange={updateField}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            Phone Number
          </span>
          <input
            className={inputClassName}
            name="phone"
            value={formData.phone}
            onChange={updateField}
            placeholder="+91..."
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            City
          </span>
          <input
            className={inputClassName}
            name="city"
            value={formData.city}
            onChange={updateField}
            required
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            Organization
          </span>
          <input
            className={inputClassName}
            name="organization"
            value={formData.organization}
            onChange={updateField}
            placeholder="College, company, collective, or independent"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            Availability
          </span>
          <input
            className={inputClassName}
            name="availability"
            value={formData.availability}
            onChange={updateField}
            placeholder="Full event / one day / pre-event support"
            required
          />
        </label>
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            Area of Interest
          </span>
          <input
            className={inputClassName}
            name="interestArea"
            value={formData.interestArea}
            onChange={updateField}
            placeholder="Registration desk, audience support, backstage, speaker care, logistics..."
            required
          />
        </label>
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            Why You Want to Volunteer
          </span>
          <textarea
            className={`${inputClassName} min-h-56 resize-y`}
            name="motivation"
            value={formData.motivation}
            onChange={updateField}
            placeholder="Tell us what draws you to TASI, how you like to contribute, and what kind of event experience you would like to be part of."
            required
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:mt-auto sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-stone-950 px-7 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-stone-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Apply as a Volunteer'}
        </button>

        <p className="text-sm text-stone-500 dark:text-slate-400">
          Prefer email? Write to{' '}
          <a
            href="mailto:info1@csrindia.org?subject=TASI%202026%20Volunteer%20Application"
            className="font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200"
          >
            info1@csrindia.org
          </a>
        </p>
      </div>

      {status.message && (
        <div
          className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200'
          }`}
        >
          {status.message}
        </div>
      )}
    </form>
  );
}
