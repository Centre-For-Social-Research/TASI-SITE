'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ATTENDEE_CATEGORIES,
  QR_PASS_RELEASE_TIMING,
} from '@/lib/registration-constants';

const FIELD_CLASS =
  'h-12 rounded-[10px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-amber-500/20';
const ERROR_CLASS = 'mt-1 text-xs text-red-600 dark:text-red-400';

async function readImageDimensions(file) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = imageUrl;
    });
    return { width: image.width, height: image.height };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function RegistrationForm() {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoNote, setPhotoNote] = useState(
    'Upload a JPG or PNG under 100KB. Recommended size: 400 x 400 pixels.'
  );
  const [photoError, setPhotoError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      organization: '',
      designation: '',
      attendee_category: 'Government',
      city: '',
      country: 'India',
      linkedin_url: '',
      attendance_reason: '',
    },
  });

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setPhotoError('');

    if (!file) {
      setProfilePhoto(null);
      setPhotoNote(
        'Upload a JPG or PNG under 100KB. Recommended size: 400 x 400 pixels.'
      );
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setProfilePhoto(null);
      setPhotoError('Only JPG, JPEG, and PNG files are supported.');
      return;
    }

    if (file.size > 100 * 1024) {
      setProfilePhoto(null);
      setPhotoError('Profile photo must be 100KB or smaller.');
      return;
    }

    try {
      const dimensions = await readImageDimensions(file);
      if (dimensions.width < 200 || dimensions.height < 200) {
        setProfilePhoto(null);
        setPhotoError('Profile photo must be at least 200 x 200 pixels.');
        return;
      }
      setProfilePhoto(file);
      setPhotoNote(
        `Selected ${file.name} â€¢ ${dimensions.width} x ${dimensions.height} â€¢ ${Math.ceil(file.size / 1024)}KB`
      );
    } catch {
      setProfilePhoto(null);
      setPhotoError(
        'We could not read that image. Please try another JPG or PNG file.'
      );
    }
  }

  async function onSubmit(data) {
    setStatus({ type: '', message: '' });

    if (!profilePhoto) {
      setPhotoError('Please upload a valid profile photo before submitting.');
      return;
    }

    try {
      const payload = new FormData();
      Object.entries(data).forEach(([key, value]) =>
        payload.append(key, value)
      );
      payload.append('profile_photo', profilePhoto);

      const response = await fetch('/api/registrations/create', {
        method: 'POST',
        body: payload,
      });
      const result = await response.json();

      if (!response.ok) {
        setStatus({
          type: 'error',
          message: result.error || 'Unable to submit registration.',
        });
        return;
      }

      reset();
      setProfilePhoto(null);
      setPhotoNote(
        'Upload a JPG or PNG under 100KB. Recommended size: 400 x 400 pixels.'
      );
      setStatus({
        type: 'success',
        message: result.emailQueued
          ? `Registration submitted. Your application is now under review. Registration ID: ${result.registrationCode}.`
          : `Registration submitted. Your application is now under review. Registration ID: ${result.registrationCode}. We could not send the acknowledgment email automatically yet, but the TASI team can resend it from the dashboard.`,
      });
    } catch {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again in a moment.',
      });
    }
  }

  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Registration Form
        </p>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Apply for TASI 2026
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Registrations are reviewed manually by the TASI team. Approved
          attendees will receive their QR-based entry pass{' '}
          {QR_PASS_RELEASE_TIMING}.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid gap-4 md:grid-cols-2"
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            First Name
          </span>
          <input
            className={FIELD_CLASS}
            {...register('first_name', { required: 'First name is required' })}
          />
          {errors.first_name && (
            <span className={ERROR_CLASS}>{errors.first_name.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Last Name
          </span>
          <input
            className={FIELD_CLASS}
            {...register('last_name', { required: 'Last name is required' })}
          />
          {errors.last_name && (
            <span className={ERROR_CLASS}>{errors.last_name.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Email
          </span>
          <input
            type="email"
            className={FIELD_CLASS}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />
          {errors.email && (
            <span className={ERROR_CLASS}>{errors.email.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Phone
          </span>
          <input
            className={FIELD_CLASS}
            {...register('phone', { required: 'Phone number is required' })}
          />
          {errors.phone && (
            <span className={ERROR_CLASS}>{errors.phone.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Organization
          </span>
          <input
            className={FIELD_CLASS}
            {...register('organization', {
              required: 'Organization is required',
            })}
          />
          {errors.organization && (
            <span className={ERROR_CLASS}>{errors.organization.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Designation
          </span>
          <input
            className={FIELD_CLASS}
            {...register('designation', {
              required: 'Designation is required',
            })}
          />
          {errors.designation && (
            <span className={ERROR_CLASS}>{errors.designation.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Category / Attendee Type
          </span>
          <select
            className={FIELD_CLASS}
            {...register('attendee_category', { required: true })}
          >
            {ATTENDEE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            LinkedIn Profile
          </span>
          <input
            type="url"
            className={FIELD_CLASS}
            placeholder="https://www.linkedin.com/in/..."
            {...register('linkedin_url', {
              required: 'LinkedIn profile URL is required',
              pattern: {
                value: /^https?:\/\/(www\.)?linkedin\.com\//,
                message: 'Enter a valid LinkedIn URL',
              },
            })}
          />
          {errors.linkedin_url && (
            <span className={ERROR_CLASS}>{errors.linkedin_url.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            City
          </span>
          <input
            className={FIELD_CLASS}
            {...register('city', { required: 'City is required' })}
          />
          {errors.city && (
            <span className={ERROR_CLASS}>{errors.city.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Country
          </span>
          <input
            className={FIELD_CLASS}
            {...register('country', { required: 'Country is required' })}
          />
          {errors.country && (
            <span className={ERROR_CLASS}>{errors.country.message}</span>
          )}
        </label>

        <label className="md:col-span-2 flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Why do you want to attend?{' '}
            <span className="font-normal text-slate-500">(Optional)</span>
          </span>
          <textarea
            className="min-h-48 rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-amber-500/20"
            {...register('attendance_reason')}
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Upload Profile Photo
          </span>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handlePhotoChange}
            className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          />
          {photoError ? (
            <span className={ERROR_CLASS}>{photoError}</span>
          ) : (
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {photoNote}
            </p>
          )}
        </label>

        <div className="md:col-span-2 flex flex-col gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#4C1D95] px-6 text-sm font-semibold text-white transition hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? 'Submitting registration...'
              : 'Submit Registration'}
          </button>
          {status.message ? (
            <p
              className={`text-sm leading-relaxed ${
                status.type === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {status.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
