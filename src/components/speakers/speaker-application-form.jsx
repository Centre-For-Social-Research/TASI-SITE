"use client";

import { useState } from "react";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  organization: "",
  role: "",
  topic: "",
  pitch: "",
};

export default function SpeakerApplicationForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/speaker-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim().toLowerCase(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          organization: formData.organization.trim(),
          role: formData.role.trim(),
          topic: formData.topic.trim(),
          pitch: formData.pitch.trim(),
        }),
      });

      let payload = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        payload = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          payload = { error: text };
        }
      }

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit your application.");
      }

      setFormData(initialFormState);
      setStatus({
        type: "success",
        message: "Application received. The TASI team will review it and reach out if there is a fit.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to submit your application.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-orange-400 dark:focus:bg-slate-900 dark:focus:ring-orange-500/20";

  return (
    <div className="flex h-full flex-col rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="border-b border-stone-200/80 px-6 py-6 dark:border-slate-800 sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">Speaker Application</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-stone-950 dark:text-white sm:text-3xl">
          Tell us what you want to bring to TASI 2026
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-slate-300">
          Share your perspective, the conversation you want to shape, and the audience need it responds to.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex h-full flex-col px-6 py-6 sm:px-8 sm:py-7">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">First Name</span>
            <input className={inputClassName} name="firstName" value={formData.firstName} onChange={updateField} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">Last Name</span>
            <input className={inputClassName} name="lastName" value={formData.lastName} onChange={updateField} required />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">Contact Email</span>
            <input className={inputClassName} type="email" name="email" value={formData.email} onChange={updateField} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">Organization</span>
            <input className={inputClassName} name="organization" value={formData.organization} onChange={updateField} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">Role</span>
            <input className={inputClassName} name="role" value={formData.role} onChange={updateField} required />
          </label>
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">Session Topic</span>
            <input
              className={inputClassName}
              name="topic"
              value={formData.topic}
              onChange={updateField}
              placeholder="AI governance, child safety, trust and safety operations..."
              required
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">Why You Should Be on Stage</span>
            <textarea
              className={`${inputClassName} min-h-44 resize-y`}
              name="pitch"
              value={formData.pitch}
              onChange={updateField}
              placeholder="Share the audience you speak to, the perspective you would bring, and the format or conversation you would like to shape."
              minLength={40}
              maxLength={5000}
              required
            />
          </label>
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-stone-200/80 pt-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-7 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-stone-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Apply to Speak"}
          </button>

          <p className="max-w-sm text-sm leading-relaxed text-stone-500 dark:text-slate-400">
            Prefer email? Write to{" "}
            <a href="mailto:info1@csrindia.org?subject=TASI%202026%20Speaker%20Application" className="font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">
              info1@csrindia.org
            </a>
          </p>
        </div>

        {status.message && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              status.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200"
            }`}
          >
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}
