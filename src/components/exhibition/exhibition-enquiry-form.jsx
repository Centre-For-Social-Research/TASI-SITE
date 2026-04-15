'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
};

function buildMessageBody(form) {
  return [
    'Exhibition enquiry for TASI 2026',
    `Name: ${form.name.trim()}`,
    `Company: ${form.company.trim()}`,
    `Email: ${form.email.trim().toLowerCase()}`,
    `Phone: ${form.phone.trim() || 'Not provided'}`,
    '',
    'Enquiry details:',
    form.message.trim(),
  ].join('\n');
}

export default function ExhibitionEnquiryForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          message: buildMessageBody(form),
          source: 'exhibition-enquiry',
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
        setStatus({
          type: 'error',
          message:
            data?.error ||
            `Request failed (${response.status}). Please try again.`,
        });
        return;
      }

      setForm(initialForm);
      setStatus({
        type: 'success',
        message:
          'We received your enquiry. The TASI team will reach out to discuss the right exhibition fit.',
      });
    } catch (error) {
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Network error while submitting your enquiry. Please try again.';

      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="exhibition-enquiry-name"
            className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-800"
          >
            Full name *
          </label>
          <Input
            id="exhibition-enquiry-name"
            name="name"
            value={form.name}
            onChange={updateField}
            placeholder="Your name"
            className="h-11 rounded-[10px] border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="exhibition-enquiry-company"
            className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-800"
          >
            Organisation *
          </label>
          <Input
            id="exhibition-enquiry-company"
            name="company"
            value={form.company}
            onChange={updateField}
            placeholder="Organisation name"
            className="h-11 rounded-[10px] border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-500"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="exhibition-enquiry-email"
            className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-800"
          >
            Work email *
          </label>
          <Input
            id="exhibition-enquiry-email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            placeholder="you@organisation.com"
            className="h-11 rounded-[10px] border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="exhibition-enquiry-phone"
            className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-800"
          >
            Phone
          </label>
          <Input
            id="exhibition-enquiry-phone"
            name="phone"
            value={form.phone}
            onChange={updateField}
            placeholder="+91 ..."
            className="h-11 rounded-[10px] border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="exhibition-enquiry-message"
          className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-800"
        >
          What would you like to explore? *
        </label>
        <Textarea
          id="exhibition-enquiry-message"
          name="message"
          value={form.message}
          onChange={updateField}
          placeholder="Tell us about your organisation, what kind of presence you are considering, and any early questions."
          className="min-h-[150px] rounded-[10px] border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-500"
          minLength={10}
          maxLength={5000}
          required
        />
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-auto rounded-[10px] bg-[#1a1230] px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-[#140f26]"
        >
          {isSubmitting ? 'Submitting...' : 'Send exhibition enquiry'}
        </Button>
        <p className="text-sm leading-relaxed text-stone-500">
          Your enquiry will be reviewed by the TASI team and routed through the
          existing contact workflow.
        </p>
      </div>

      {status.message ? (
        <p
          className={`text-sm leading-relaxed ${
            status.type === 'error' ? 'text-red-700' : 'text-emerald-700'
          }`}
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
