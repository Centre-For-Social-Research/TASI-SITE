'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MEDIA_COVERAGE_DAYS,
  MEDIA_OUTLET_TYPES,
} from '@/data/media-accreditation';

const initialFormState = {
  name: '',
  publication: '',
  outletType: '',
  email: '',
  phone: '',
  coverageDays: '',
};

const fieldClassName =
  'h-11 rounded-[10px] border-0 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-500 focus-visible:ring-2 focus-visible:ring-white';
const labelClassName =
  'mb-2 block text-xs font-black uppercase tracking-[0.12em] text-white';

export default function MediaAccreditationSection() {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/media-accreditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          publication: formData.publication.trim(),
          outletType: formData.outletType,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          coverageDays: formData.coverageDays,
        }),
      });

      let data = null;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          data = { error: text };
        }
      }

      if (!response.ok) {
        setStatus(data?.error || `Request failed (${response.status}).`);
      } else {
        setStatus(
          'Application received. We have emailed you a confirmation, and the TASI team will review your accreditation request.'
        );
        setFormData(initialFormState);
      }
    } catch (error) {
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Network error while submitting your request. Please try again.';

      setStatus(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="media-accreditation-form-title"
      className="w-full min-w-0 overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_52%,#141c56_100%)] text-white shadow-[0_28px_80px_-42px_rgba(53,2,101,0.72)]"
    >
      <div className="flex flex-col overflow-hidden">
        <div className="order-2 flex flex-col justify-center px-6 py-8 md:px-10 md:py-10 lg:px-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
            Application form
          </p>
          <h2
            id="media-accreditation-form-title"
            className="mt-3 text-2xl font-black tracking-tight text-white md:text-4xl"
          >
            Submit your accreditation request
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white md:text-[1.05rem] md:leading-[1.55]">
            Complete the form below to request press access for TASI 2026. All
            applications are reviewed by the TASI media team.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/82 md:text-[15px]">
            Your personal data will be processed in line with our{' '}
            <a
              className="font-semibold underline underline-offset-4"
              href="/privacy-policy"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              className="font-semibold underline underline-offset-4"
              href="/terms-of-service"
            >
              T&amp;Cs
            </a>
            .
          </p>

          <form className="mt-6 w-full" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="media-name" className={labelClassName}>
                  Full name *
                </label>
                <Input
                  id="media-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={updateField}
                  placeholder="Priya Sharma"
                  className={fieldClassName}
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label htmlFor="media-publication" className={labelClassName}>
                  Publication *
                </label>
                <Input
                  id="media-publication"
                  name="publication"
                  type="text"
                  autoComplete="organization"
                  value={formData.publication}
                  onChange={updateField}
                  placeholder="The Daily Chronicle"
                  className={fieldClassName}
                  maxLength={160}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="media-business-email"
                  className={labelClassName}
                >
                  Business email address *
                </label>
                <Input
                  id="media-business-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={updateField}
                  placeholder="user@example.com"
                  className={fieldClassName}
                  required
                />
              </div>

              <div>
                <label htmlFor="media-phone" className={labelClassName}>
                  Contact number *
                </label>
                <Input
                  id="media-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={updateField}
                  placeholder="+91 98765 43210"
                  className={fieldClassName}
                  maxLength={24}
                  required
                />
              </div>

              <div>
                <label htmlFor="media-outlet-type" className={labelClassName}>
                  Outlet type *
                </label>
                <select
                  id="media-outlet-type"
                  name="outletType"
                  value={formData.outletType}
                  onChange={updateField}
                  className={`${fieldClassName} w-full appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2357534e' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[right_1rem_center] bg-no-repeat pr-10`}
                  required
                >
                  <option value="" disabled>
                    Select outlet type
                  </option>
                  {MEDIA_OUTLET_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="media-coverage-days" className={labelClassName}>
                  Covering{' '}
                  <span className="font-bold normal-case tracking-normal text-white/60">
                    (optional)
                  </span>
                </label>
                <select
                  id="media-coverage-days"
                  name="coverageDays"
                  value={formData.coverageDays}
                  onChange={updateField}
                  className={`${fieldClassName} w-full appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2357534e' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[right_1rem_center] bg-no-repeat pr-10`}
                >
                  <option value="">Select a day</option>
                  {MEDIA_COVERAGE_DAYS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-auto rounded-xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-stone-900 hover:bg-stone-100"
              >
                {isSubmitting
                  ? 'Submitting...'
                  : 'Apply for media accreditation'}
              </Button>
            </div>

            {status ? (
              <p
                className="mt-3 text-sm leading-relaxed text-white/88"
                role="status"
                aria-live="polite"
              >
                {status}
              </p>
            ) : null}
          </form>
        </div>

        <div className="relative order-1 min-h-[220px] md:min-h-[260px]">
          <Image
            src="/img/hero-bg-2.png"
            alt="Delegates and media professionals at a TASI gathering"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 62vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
