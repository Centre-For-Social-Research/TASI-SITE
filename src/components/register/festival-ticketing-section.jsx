'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  BookUser,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Coffee,
  FileText,
  Gift,
  Globe,
  Handshake,
  Info,
  Linkedin,
  LockKeyhole,
  LoaderCircle,
  MessageCircleMore,
  Mic,
  MonitorPlay,
  PartyPopper,
  Sparkles,
  UtensilsCrossed,
  Users,
  X,
} from 'lucide-react';
import { AdminAlert } from '@/components/admin/admin-ui';
import { GlowCard } from '@/components/ui/spotlight-card';
import {
  FESTIVAL_PAYMENTS_DISABLED_MESSAGE,
  FESTIVAL_PAYMENTS_ENABLED,
} from '@/lib/festival-ticketing-constants';
import { festivalCreateOrderSchema } from '@/lib/festival-ticketing-validation';

const COUNTRY_OPTIONS = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'SG', label: 'Singapore' },
  { code: 'DE', label: 'Germany' },
  { code: 'AU', label: 'Australia' },
  { code: 'CA', label: 'Canada' },
];

const INITIAL_FORM = {
  fullName: '',
  email: '',
  confirmEmail: '',
  organization: '',
  jobTitle: '',
  country: 'IN',
  phone: '',
  linkedinUrl: '',
  profilePhotoPath: '',
  billingName: '',
  billingEmail: '',
  billingPhone: '',
  billingAddressLine1: '',
  billingAddressLine2: '',
  billingCity: '',
  billingStateOrProvince: '',
  billingPostalCode: '',
  billingCountry: 'IN',
  taxIdNumber: '',
  gstin: '',
  passportOrNationalId: '',
  noRefundAccepted: false,
  termsAccepted: false,
  privacyAccepted: false,
};

const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png']);
const ALLOWED_PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;

const FESTIVAL_PASS_OPTIONS = [
  {
    label: 'Domestic',
    title: 'Domestic',
    description:
      'For attendees based in India, with tax-ready invoicing and domestic Razorpay routing.',
    country: 'IN',
    badgePattern: 'mosaic',
  },
  {
    label: 'International',
    title: 'International',
    description:
      'For attendees joining from outside India, with export invoice support and international-compliant routing.',
    country: 'US',
    badgePattern: 'rings',
  },
];

const REVIEW_INCLUDED_ITEMS = [
  {
    title: 'Everything in Free Pass',
    description: 'Full session access + all basic hospitality',
  },
  {
    title: 'Exclusive Receptions',
    description: 'Inaugural Reception, Gala Dinner, Closing Ceremony',
  },
  {
    title: 'Networking & Access',
    description: 'Curated networking, reserved seating, roundtables',
  },
  {
    title: 'Professional Benefits',
    description: 'Certificate, premium badge, priority entry',
  },
];

const FULL_BLEED_COMPARISON_ROWS = [
  {
    icon: Mic,
    label: 'Conference Access (Day 1 & Day 2)',
    free: true,
    paid: true,
  },
  {
    icon: Users,
    label: 'All panels, keynotes, and discussions',
    free: true,
    paid: true,
  },
  {
    icon: Coffee,
    label: 'AM/PM Tea and Lunch (Both Days)',
    free: true,
    paid: true,
  },
  {
    icon: PartyPopper,
    label: 'Inaugural Reception & Closing Ceremony',
    free: false,
    paid: true,
  },
  {
    icon: UtensilsCrossed,
    label: 'Gala Dinner',
    free: false,
    paid: true,
  },
  {
    icon: Users,
    label: 'Curated networking opportunities',
    free: false,
    paid: true,
  },
  {
    icon: BadgeCheck,
    label: 'Reserved seating (front or priority zones)',
    free: false,
    paid: true,
  },
  {
    icon: MonitorPlay,
    label: 'Access to post-event session recordings',
    free: false,
    paid: true,
  },
  {
    icon: Handshake,
    label: 'Curated 1:1 meeting slots (limited / request-based)',
    free: false,
    paid: true,
  },
  {
    icon: Gift,
    label: 'Digital goodie kit (reports, toolkits, partner resources)',
    free: false,
    paid: true,
  },
  {
    icon: BookUser,
    label: 'Name listing on official website (attendee recognition)',
    free: false,
    paid: true,
  },
  {
    icon: MessageCircleMore,
    label: 'Access to Stakeholder Engagement Roundtable',
    free: false,
    paid: true,
  },
  {
    icon: FileText,
    label: 'Curated discussion summaries (not public)',
    free: false,
    paid: true,
  },
  {
    icon: Users,
    label: 'VIP lounge / informal networking zone access',
    free: false,
    paid: true,
  },
  {
    icon: BadgeCheck,
    label: 'Certificate of Participation & Premium Badge',
    free: false,
    paid: true,
  },
];

function getTicketPreview(country) {
  if (country === 'IN') {
    return {
      label: 'Domestic Pass',
      description:
        'Includes 18% GST and routes exclusively to the domestic NGO Razorpay account.',
      complianceLabel: 'GST invoice required',
      badgeLabel: 'DOMESTIC PASS',
    };
  }

  return {
    label: 'International Pass',
    description:
      'Zero-rated export invoice and exclusive routing to the FCRA Razorpay account.',
    complianceLabel: 'Export invoice and identity record required',
    badgeLabel: 'INTERNATIONAL PASS',
  };
}

function getTicketBreakdown(country) {
  if (country === 'IN') {
    return {
      invoiceTreatment: 'GST invoice support for India-based attendees',
      paymentMessage:
        'By proceeding, you confirm that your country of residence is India. This determines the regulatory channel for your payment.',
      paymentGatewayLabel: 'Domestic payment gateway',
    };
  }

  return {
    invoiceTreatment: 'Export invoice support for attendees outside India',
    paymentMessage:
      'By proceeding, you confirm that your country of residence is outside India. This determines the regulatory channel for your payment.',
    paymentGatewayLabel: 'International payment gateway',
  };
}

function getTicketSurface(pattern) {
  if (pattern === 'mosaic') {
    return 'bg-[linear-gradient(180deg,rgba(46,6,89,0.15),rgba(77,7,106,0.72)),linear-gradient(45deg,#b12f2a_12.5%,transparent_12.5%_25%,#cf3f1d_25%_37.5%,transparent_37.5%_50%,#70206b_50%_62.5%,transparent_62.5%_75%,#f08b18_75%_87.5%,transparent_87.5%),linear-gradient(-45deg,#762071_12.5%,transparent_12.5%_25%,#cf3f1d_25%_37.5%,transparent_37.5%_50%,#f08b18_50%_62.5%,transparent_62.5%_75%,#932047_75%_87.5%,transparent_87.5%),linear-gradient(180deg,#60207f_0%,#7d1249_54%,#3a0a6c_100%)] bg-[length:72px_72px,72px_72px,72px_72px,100%_100%]';
  }

  return 'bg-[radial-gradient(circle_at_20%_20%,rgba(255,159,28,0.75)_0_18%,transparent_18%_100%),radial-gradient(circle_at_72%_28%,rgba(255,159,28,0.68)_0_18%,transparent_18%_100()),radial-gradient(circle_at_50%_65%,rgba(255,159,28,0.6)_0_18%,transparent_18%_100()),linear-gradient(180deg,#5c1d67_0%,#7c114f_46%,#a20f4a_100%)]';
}

function getTicketSurfaceStyle(pattern) {
  if (pattern === 'rings') {
    return {
      backgroundImage:
        'radial-gradient(circle at 20% 20%, rgba(255,159,28,0.75) 0 18%, transparent 18% 100%), radial-gradient(circle at 72% 28%, rgba(255,159,28,0.68) 0 18%, transparent 18% 100%), radial-gradient(circle at 50% 65%, rgba(255,159,28,0.6) 0 18%, transparent 18% 100%), linear-gradient(180deg, #5c1d67 0%, #7c114f 46%, #a20f4a 100%)',
      backgroundColor: '#7c114f',
    };
  }

  return undefined;
}

function getFileExtension(fileName) {
  return String(fileName || '')
    .split('.')
    .pop()
    .toLowerCase();
}

function validateTicketPhotoFile(file) {
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return 'Photo must be a JPG, JPEG, or PNG file.';
  }

  if (!ALLOWED_PHOTO_EXTENSIONS.has(getFileExtension(file.name))) {
    return 'Photo filename must end in .jpg, .jpeg, or .png.';
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return 'Photo must be 2 MB or smaller.';
  }

  return '';
}

function getSelectionForCountry(country) {
  return String(country || '')
    .trim()
    .toUpperCase() === 'IN'
    ? 'IN'
    : 'US';
}

function getOptionForSelection(selection) {
  return FESTIVAL_PASS_OPTIONS.find((option) => option.country === selection);
}

function getFriendlyErrorMessage(errorValue, fallbackMessage) {
  if (!errorValue) return fallbackMessage;

  if (typeof errorValue === 'string') {
    const trimmed = errorValue.trim();

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);

        if (Array.isArray(parsed)) {
          const firstIssue = parsed.find(
            (issue) => issue && typeof issue.message === 'string'
          );

          if (firstIssue?.message) {
            return firstIssue.message;
          }
        }

        if (parsed && typeof parsed.error === 'string') {
          return parsed.error;
        }
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  if (errorValue instanceof Error) {
    return getFriendlyErrorMessage(errorValue.message, fallbackMessage);
  }

  return fallbackMessage;
}

async function loadRazorpayScript() {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function FormField({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

function StepIndicator({ currentStep }) {
  const steps = [
    { key: 'details', label: 'Details' },
    { key: 'review', label: 'Review' },
    { key: 'payment', label: 'Payment' },
  ];
  const activeIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="mx-auto flex max-w-[340px] items-center justify-between">
      {steps.map((step, index) => {
        const isComplete = activeIndex > index;
        const isCurrent = activeIndex === index;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                  isComplete
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  isCurrent ? 'text-[#2563eb]' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={`mx-4 h-px w-12 ${
                  activeIndex > index ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function getSafePhotoPreviewUrl(previewUrl) {
  if (typeof previewUrl !== 'string') return null;

  try {
    const parsedUrl = new URL(previewUrl);
    return parsedUrl.protocol === 'blob:' ? parsedUrl.toString() : null;
  } catch {
    return null;
  }
}

export default function FestivalTicketingSection() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedCard, setSelectedCard] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [step, setStep] = useState('details');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploadStatus, setPhotoUploadStatus] = useState('idle'); // idle | uploading | done | error
  const [paymentSession, setPaymentSession] = useState({
    status: 'idle',
    orderId: '',
    amountLabel: '',
    gatewayLabel: '',
    payload: null,
  });
  const [billingSameAsProfile, setBillingSameAsProfile] = useState(false);

  const preview = useMemo(() => getTicketPreview(form.country), [form.country]);
  const safePhotoPreview = useMemo(
    () => getSafePhotoPreviewUrl(photoPreview),
    [photoPreview]
  );
  const pricing = useMemo(
    () => getTicketBreakdown(form.country),
    [form.country]
  );
  const isDomestic =
    String(form.country || '')
      .trim()
      .toUpperCase() === 'IN';
  useEffect(() => {
    if (!ticketModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeTicketModal();
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [ticketModalOpen]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const fieldClassName =
    'mt-2 h-12 w-full rounded-[10px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200';

  const textAreaClassName =
    'mt-2 min-h-24 w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200';

  function updateField(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (billingSameAsProfile) {
        if (key === 'fullName') next.billingName = value;
        if (key === 'email') next.billingEmail = value;
        if (key === 'phone') next.billingPhone = value;
        if (key === 'country') next.billingCountry = value;
      }
      return next;
    });
  }

  function handleBillingSameToggle(checked) {
    setBillingSameAsProfile(checked);
    if (checked) {
      setForm((current) => ({
        ...current,
        billingName: current.fullName,
        billingEmail: current.email,
        billingPhone: current.phone,
        billingCountry: current.country,
      }));
    }
  }

  function closeTicketModal() {
    setTicketModalOpen(false);
    setSelectedCard(null);
    setStep('details');
    setSubmitting(false);
    setPhotoPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return null;
    });
    setPhotoUploadStatus('idle');
    setPaymentSession({
      status: 'idle',
      orderId: '',
      amountLabel: '',
      gatewayLabel: '',
      payload: null,
    });
    setStatus({ type: '', message: '' });
    setBillingSameAsProfile(false);
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const photoError = validateTicketPhotoFile(file);
    if (photoError) {
      setPhotoPreview((currentPreview) => {
        if (currentPreview) URL.revokeObjectURL(currentPreview);
        return null;
      });
      setPhotoUploadStatus('error');
      updateField('profilePhotoPath', '');
      setStatus({ type: 'error', message: photoError });
      event.target.value = '';
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setPhotoPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return nextPreview;
    });
    setPhotoUploadStatus('uploading');
    updateField('profilePhotoPath', '');

    const fd = new FormData();
    fd.append('photo', file);

    try {
      const res = await fetch('/api/tickets/upload-photo', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed.');
      updateField('profilePhotoPath', data.path);
      setPhotoUploadStatus('done');
    } catch (err) {
      URL.revokeObjectURL(nextPreview);
      setPhotoPreview(null);
      setPhotoUploadStatus('error');
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Photo upload failed.',
      });
    }
  }

  function openTicketModal(country) {
    if (!FESTIVAL_PAYMENTS_ENABLED) {
      setStatus({
        type: 'error',
        message: FESTIVAL_PAYMENTS_DISABLED_MESSAGE,
      });
      return;
    }

    const normalizedCountry = getSelectionForCountry(country);

    setSelectedCard(normalizedCountry);
    setTicketModalOpen(true);
    setStep('details');
    setPaymentSession({
      status: 'idle',
      orderId: '',
      amountLabel: '',
      gatewayLabel: '',
      payload: null,
    });
    setStatus({ type: '', message: '' });
    setForm((current) => ({
      ...current,
      country: normalizedCountry,
      billingCountry: normalizedCountry,
    }));
  }

  function goToReviewStep() {
    const validation = festivalCreateOrderSchema.safeParse(form);

    if (!validation.success) {
      setStatus({
        type: 'error',
        message:
          validation.error.issues[0]?.message ||
          'Please complete the required registration details.',
      });
      return;
    }

    setStatus({ type: '', message: '' });
    setStep('review');
  }

  async function preparePaymentStep() {
    if (!FESTIVAL_PAYMENTS_ENABLED) {
      setStatus({
        type: 'error',
        message: FESTIVAL_PAYMENTS_DISABLED_MESSAGE,
      });
      return;
    }

    const validation = festivalCreateOrderSchema.safeParse(form);

    if (!validation.success) {
      setStep('details');
      setStatus({
        type: 'error',
        message:
          validation.error.issues[0]?.message ||
          'Please complete the required registration details.',
      });
      return;
    }

    setStep('payment');
    setStatus({ type: '', message: '' });
    setPaymentSession({
      status: 'loading',
      orderId: '',
      amountLabel: '',
      gatewayLabel: pricing.paymentGatewayLabel,
      payload: null,
    });

    try {
      const response = await fetch('/api/tickets/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          getFriendlyErrorMessage(
            typeof data === 'string' ? data : data?.error,
            'Unable to create your festival ticket.'
          )
        );
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay checkout could not be loaded.');
      }

      setPaymentSession({
        status: 'ready',
        orderId: data.razorpayOrderId,
        amountLabel: '',
        gatewayLabel: pricing.paymentGatewayLabel,
        payload: data,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to initialise secure payment.';

      setStatus({ type: 'error', message });
      setPaymentSession({
        status: 'error',
        orderId: '',
        amountLabel: '',
        gatewayLabel: pricing.paymentGatewayLabel,
        payload: null,
      });
    }
  }

  async function launchPreparedCheckout() {
    if (!FESTIVAL_PAYMENTS_ENABLED) return;
    if (paymentSession.status !== 'ready' || !paymentSession.payload) return;

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const data = paymentSession.payload;
      const razorpay = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.totalAmountMinor,
        currency: data.currency,
        name: 'TASI 2026',
        description:
          data.ticketType === 'domestic'
            ? 'Domestic Festival Pass'
            : 'International Festival Pass',
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: '#17203a',
        },
        handler: async (paymentResult) => {
          const verifyResponse = await fetch('/api/tickets/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticketId: data.ticketId,
              razorpayOrderId: paymentResult.razorpay_order_id,
              razorpayPaymentId: paymentResult.razorpay_payment_id,
              razorpaySignature: paymentResult.razorpay_signature,
            }),
          });
          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok) {
            throw new Error(
              verifyData?.error || 'Payment verification failed.'
            );
          }

          closeTicketModal();
          router.push(
            `/tickets/success?ticket=${encodeURIComponent(data.ticketNumber)}`
          );
        },
      });

      razorpay.open();
    } catch (error) {
      setStatus({
        type: 'error',
        message: getFriendlyErrorMessage(
          error,
          'Unable to complete your festival ticket purchase.'
        ),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto mt-12 max-w-6xl px-6 sm:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Festival Ticketing
        </p>
        <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
          Choose your ticket
        </h3>
        <div className="mx-auto mt-4 h-[2px] w-28 bg-[#3a2c8f]" />
        {!FESTIVAL_PAYMENTS_ENABLED ? (
          <div className="mx-auto mt-6 max-w-2xl rounded-[10px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold leading-relaxed text-amber-900">
            {FESTIVAL_PAYMENTS_DISABLED_MESSAGE}
          </div>
        ) : null}
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-2">
        {FESTIVAL_PASS_OPTIONS.map((option) => {
          const isActive = selectedCard === option.country;
          const useReceptionStyleCard = option.country === 'US';

          return (
            <article key={option.label} className="text-center">
              <button
                type="button"
                onClick={() => openTicketModal(option.country)}
                disabled={!FESTIVAL_PAYMENTS_ENABLED}
                aria-disabled={!FESTIVAL_PAYMENTS_ENABLED}
                className={`mx-auto block w-full max-w-[300px] text-left ${
                  FESTIVAL_PAYMENTS_ENABLED
                    ? ''
                    : 'cursor-not-allowed opacity-60 grayscale'
                }`}
              >
                <GlowCard
                  customSize
                  glowColor={option.country === 'IN' ? 'orange' : 'purple'}
                  className={`block overflow-hidden rounded-[10px] p-0 transition duration-300 ${
                    isActive
                      ? useReceptionStyleCard
                        ? 'border-2 border-[#4c178a]'
                        : 'border-[3px] border-[#4c178a]'
                      : useReceptionStyleCard
                        ? 'border-2 border-stone-200'
                        : 'border-[3px] border-transparent'
                  } ${isActive ? 'scale-[1.01]' : 'hover:-translate-y-1'}`}
                >
                  <div
                    className={`relative overflow-hidden text-white ${useReceptionStyleCard ? 'h-[420px] px-7 py-6 text-left' : 'h-[424px] px-8 py-5'} ${getTicketSurface(option.badgePattern)}`}
                    style={
                      useReceptionStyleCard
                        ? getTicketSurfaceStyle(option.badgePattern)
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-3.5 w-10 rounded-full bg-white/95" />
                      <span className="inline-flex h-3.5 w-10 rounded-full bg-white/95" />
                    </div>
                    {useReceptionStyleCard ? (
                      <>
                        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#5a0d6b]/78 via-[#5a0d6b]/18 to-transparent" />
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
                          <div className="mx-auto mb-3 h-[2px] w-36 bg-white/75" />
                          <p className="mx-auto max-w-[200px] text-[2rem] font-black leading-[0.94] tracking-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)] sm:text-[2.2rem]">
                            {option.title}
                          </p>
                          <div className="mx-auto mt-3 h-[2px] w-36 bg-white/75" />
                        </div>
                        <div className="absolute bottom-6 left-7 text-lg font-black leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.28)]">
                          TASI
                          <br />
                          2026
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
                          <div className="mx-auto mb-3 h-[2px] w-36 bg-white/75" />
                          <p className="mx-auto max-w-[220px] text-[2.35rem] font-black leading-[0.92] tracking-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)] sm:text-[2.5rem]">
                            {option.title}
                          </p>
                          <div className="mx-auto mt-3 h-[2px] w-36 bg-white/75" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#5a0d6b]/78 via-[#5a0d6b]/18 to-transparent" />
                        <div className="absolute bottom-6 left-7 text-lg font-black leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.28)]">
                          TASI
                          <br />
                          2026
                        </div>
                      </>
                    )}
                  </div>
                </GlowCard>
              </button>

              <button
                type="button"
                onClick={() => openTicketModal(option.country)}
                disabled={!FESTIVAL_PAYMENTS_ENABLED}
                className={`mt-6 inline-flex rounded-[10px] px-10 py-3 text-sm font-black uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 ${
                  isActive && FESTIVAL_PAYMENTS_ENABLED
                    ? 'bg-[#3e0d7d] text-[#ffd400]'
                    : 'bg-[#43107f] text-[#ffd400] hover:opacity-90'
                }`}
              >
                {FESTIVAL_PAYMENTS_ENABLED ? 'Register now' : 'Payments paused'}
              </button>

              <h3 className="mt-6 text-[1.75rem] font-black tracking-tight text-slate-900 dark:text-white">
                {option.label}
              </h3>
              <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {option.description}
              </p>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-amber-600">
                {!FESTIVAL_PAYMENTS_ENABLED
                  ? 'Temporarily unavailable'
                  : isActive
                    ? 'Modal ready to continue'
                    : 'Tap register now to continue'}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <article className="order-2 h-full rounded-[10px] border border-slate-200/90 bg-[linear-gradient(180deg,#f8f6f1_0%,#f2f5f8_100%)] p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] lg:order-1 lg:p-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-[#6a7b98] shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
              <LockKeyhole className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 md:text-[1.7rem]">
                Free Pass
              </h3>
              <p className="mt-1 text-base text-slate-700 md:text-lg">
                (Application-Based)
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6f5e43]">
              What&apos;s Included
            </p>
            <div className="mt-5 space-y-4">
              {['Conference Access (Day 1 & 2)', 'Panels & Keynotes'].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-base text-slate-900 md:text-[1.05rem]"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[#5547ec]" />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-9">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b24a2f]">
              Not Included
            </p>
            <div className="mt-5 space-y-4">
              {[
                'Inaugural Reception & Gala Dinner',
                'Closing Ceremony',
                'Networking Access',
                'Roundtables & Speaker Access',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-base text-slate-400 md:text-[1.05rem]"
                >
                  <CircleX className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="order-1 relative h-full rounded-[10px] border border-[#efc16b]/55 bg-[linear-gradient(135deg,#350265_0%,#6a115e_58%,#ef5700_100%)] p-5 text-white shadow-[0_28px_80px_-42px_rgba(53,2,101,0.58)] ring-1 ring-[#efc16b]/35 lg:order-2 lg:p-6">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-[10px] border border-[#e0b25c] bg-[#ffd48a] px-6 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-900 shadow-[0_10px_18px_rgba(224,178,92,0.22)]">
            Recommended
          </div>

          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/12 text-[#ffd48a] shadow-[0_8px_18px_rgba(15,23,42,0.18)]">
              <BadgeCheck className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white md:text-[1.7rem]">
                Paid Pass
              </h3>
              <p className="mt-1 text-base font-semibold text-[#ffd48a] md:text-lg">
                Full Festival Experience
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ffd48a]">
              Core Benefits
            </p>
            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#ffd48a]" />
                <div>
                  <p className="text-lg font-black text-white md:text-[1.15rem]">
                    Everything in Free Pass
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/82">
                    Full session access + all basic hospitality
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#ffd48a]" />
                <div>
                  <p className="text-lg font-black text-white md:text-[1.15rem]">
                    Exclusive Receptions
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/82">
                    Inaugural Reception, Gala Dinner, Closing Ceremony
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#ffd48a]" />
                <div>
                  <p className="text-lg font-black text-white md:text-[1.15rem]">
                    Networking &amp; Access
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/82">
                    Curated networking, reserved seating, roundtables
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#ffd48a]" />
                <div>
                  <p className="text-lg font-black text-white md:text-[1.15rem]">
                    Professional Benefits
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/82">
                    Certificate, premium badge, priority entry
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="relative left-1/2 right-1/2 mt-14 w-screen -translate-x-1/2 px-5 sm:px-8">
        <section className="mx-auto max-w-[1100px] overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,#3b1365_0%,#321058_100%)] px-6 py-10 text-white shadow-[0_30px_70px_rgba(49,16,88,0.32)] sm:px-8 md:px-12 md:py-12">
          <div className="grid gap-6 md:grid-cols-[1.25fr_140px_140px] md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">
                Access Comparison
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-white md:text-[2rem]">
                Compare session-only access with the full festival experience.
              </h3>
            </div>

            <div className="text-center">
              <span className="inline-flex rounded-full bg-[#ffd919] px-4 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-950">
                Free Pass
              </span>
              <p className="mt-2 text-xs font-medium italic text-white/80">
                Application-Based
              </p>
            </div>

            <div className="text-center">
              <span className="inline-flex rounded-full bg-[#ffd919] px-4 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-950">
                Paid Pass
              </span>
              <p className="mt-2 text-xs font-medium italic text-white/80">
                Full Experience
              </p>
            </div>
          </div>

          <div className="mt-8 divide-y divide-white/10 rounded-[16px] border border-white/8 bg-white/[0.02]">
            {FULL_BLEED_COMPARISON_ROWS.map((row) => {
              const Icon = row.icon;

              return (
                <div
                  key={row.label}
                  className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[1.25fr_140px_140px] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-semibold leading-relaxed text-white sm:text-[15px]">
                      {row.label}
                    </p>
                  </div>

                  <div className="flex items-center justify-start md:justify-center">
                    {row.free ? (
                      <Check className="h-5 w-5 text-[#ffd919]" />
                    ) : (
                      <span className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>

                  <div className="flex items-center justify-start md:justify-center">
                    {row.paid ? (
                      <Check className="h-5 w-5 text-[#ffd919]" />
                    ) : (
                      <span className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs italic leading-relaxed text-white/80 sm:text-sm">
            If you&apos;re planning on registering for our{' '}
            <span className="font-black text-white">Paid Pass</span>, we
            encourage you to apply early as capacity for exclusive receptions
            and roundtables is strictly limited.
          </p>
        </section>
      </div>

      {!ticketModalOpen && status.type === 'error' ? (
        <div className="mt-6">
          <AdminAlert
            title="Festival ticketing unavailable"
            description={status.message}
            tone="danger"
          />
        </div>
      ) : null}
      {ticketModalOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:p-6">
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onClick={closeTicketModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Event Registration"
            className={`relative z-10 my-auto flex max-h-[88vh] w-full flex-col rounded-[10px] bg-white shadow-[0_30px_120px_rgba(15,23,42,0.28)] ${
              step === 'payment'
                ? 'max-w-[500px] p-5 sm:p-6'
                : 'max-w-[620px] p-5 sm:p-6 md:p-7'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 md:text-[2rem]">
                Event Registration
              </h3>
              <button
                type="button"
                onClick={closeTicketModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-slate-700 transition hover:bg-slate-100"
                aria-label="Close registration modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8">
              <StepIndicator currentStep={step} />
            </div>

            {status.type === 'error' ? (
              <div className="mt-6">
                <AdminAlert
                  title="Festival ticketing unavailable"
                  description={status.message}
                  tone="danger"
                />
              </div>
            ) : null}

            <div
              className={`mt-6 min-h-0 flex-1 overflow-y-auto pr-1 ${
                step === 'payment' ? 'max-h-[46vh]' : 'max-h-[54vh]'
              }`}
            >
              {step === 'details' ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Full Name *">
                      <input
                        className={fieldClassName}
                        placeholder="John Doe"
                        value={form.fullName}
                        onChange={(event) =>
                          updateField('fullName', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Email Address *">
                      <input
                        className={fieldClassName}
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(event) =>
                          updateField('email', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Confirm Email *">
                      <input
                        className={fieldClassName}
                        type="email"
                        placeholder="john@example.com"
                        value={form.confirmEmail}
                        onChange={(event) =>
                          updateField('confirmEmail', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Job Title">
                      <input
                        className={fieldClassName}
                        placeholder="e.g. Policy Manager"
                        value={form.jobTitle}
                        onChange={(event) =>
                          updateField('jobTitle', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Organisation">
                      <input
                        className={fieldClassName}
                        placeholder="Company or Institute"
                        value={form.organization}
                        onChange={(event) =>
                          updateField('organization', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Phone (Optional)">
                      <input
                        className={fieldClassName}
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(event) =>
                          updateField('phone', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField
                      label="LinkedIn Profile URL (Optional)"
                      hint="e.g. https://linkedin.com/in/yourname"
                    >
                      <div className="relative">
                        <Linkedin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          className={`${fieldClassName} pl-10`}
                          type="url"
                          placeholder="https://linkedin.com/in/yourname"
                          value={form.linkedinUrl}
                          onChange={(event) =>
                            updateField('linkedinUrl', event.target.value)
                          }
                        />
                      </div>
                    </FormField>
                    <FormField
                      label="Profile Photo (Optional)"
                      hint="JPG or PNG, min 150×150 px, max 2 MB. Will appear on your badge."
                    >
                      <div className="mt-2 flex items-center gap-4">
                        {safePhotoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={safePhotoPreview}
                            alt="Profile preview"
                            className="h-14 w-14 rounded-[10px] object-cover ring-2 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-slate-100 text-slate-400">
                            <Camera className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex-1">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                            <Camera className="h-4 w-4" />
                            {safePhotoPreview ? 'Change photo' : 'Upload photo'}
                            <input
                              type="file"
                              accept="image/jpeg,image/png"
                              className="sr-only"
                              onChange={handlePhotoChange}
                            />
                          </label>
                          {photoUploadStatus === 'uploading' ? (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-600">
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              Uploading…
                            </p>
                          ) : photoUploadStatus === 'done' ? (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
                              <Check className="h-3.5 w-3.5" />
                              Photo uploaded
                            </p>
                          ) : photoUploadStatus === 'error' ? (
                            <p className="mt-1 text-xs text-red-600">
                              Upload failed — try again
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </FormField>
                    <FormField label="Country of Residence *">
                      <select
                        className={fieldClassName}
                        value={form.country}
                        onChange={(event) => {
                          const nextCountry = event.target.value;
                          updateField('country', nextCountry);
                          updateField('billingCountry', nextCountry);
                          setSelectedCard(getSelectionForCountry(nextCountry));
                        }}
                      >
                        {COUNTRY_OPTIONS.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <div className="col-span-full mt-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        Billing Details
                      </p>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 select-none">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-amber-600"
                          checked={billingSameAsProfile}
                          onChange={(event) =>
                            handleBillingSameToggle(event.target.checked)
                          }
                        />
                        Same as profile details
                      </label>
                    </div>
                    <FormField label="Billing Name *">
                      <input
                        className={`${fieldClassName} ${billingSameAsProfile ? 'cursor-not-allowed bg-slate-50 text-slate-400' : ''}`}
                        placeholder="Billing name"
                        value={form.billingName}
                        disabled={billingSameAsProfile}
                        onChange={(event) =>
                          updateField('billingName', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Billing Email *">
                      <input
                        className={`${fieldClassName} ${billingSameAsProfile ? 'cursor-not-allowed bg-slate-50 text-slate-400' : ''}`}
                        type="email"
                        placeholder="billing@example.com"
                        value={form.billingEmail}
                        disabled={billingSameAsProfile}
                        onChange={(event) =>
                          updateField('billingEmail', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Billing Phone *">
                      <input
                        className={`${fieldClassName} ${billingSameAsProfile ? 'cursor-not-allowed bg-slate-50 text-slate-400' : ''}`}
                        placeholder="+91 98765 43210"
                        value={form.billingPhone}
                        disabled={billingSameAsProfile}
                        onChange={(event) =>
                          updateField('billingPhone', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Billing Address Line 1 *">
                      <input
                        className={fieldClassName}
                        placeholder="Address line 1"
                        value={form.billingAddressLine1}
                        onChange={(event) =>
                          updateField('billingAddressLine1', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Billing City *">
                      <input
                        className={fieldClassName}
                        placeholder="Billing city"
                        value={form.billingCity}
                        onChange={(event) =>
                          updateField('billingCity', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="State or Province *">
                      <input
                        className={fieldClassName}
                        placeholder="State or province"
                        value={form.billingStateOrProvince}
                        onChange={(event) =>
                          updateField(
                            'billingStateOrProvince',
                            event.target.value
                          )
                        }
                      />
                    </FormField>
                    <FormField label="Billing Postal Code *">
                      <input
                        className={fieldClassName}
                        placeholder="Postal code"
                        value={form.billingPostalCode}
                        onChange={(event) =>
                          updateField('billingPostalCode', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField
                      label={isDomestic ? 'GSTIN' : 'Passport or National ID *'}
                    >
                      <input
                        className={fieldClassName}
                        placeholder={
                          isDomestic ? 'GSTIN' : 'Passport or national ID'
                        }
                        value={
                          isDomestic ? form.gstin : form.passportOrNationalId
                        }
                        onChange={(event) =>
                          updateField(
                            isDomestic ? 'gstin' : 'passportOrNationalId',
                            event.target.value
                          )
                        }
                      />
                    </FormField>
                    <FormField
                      label={
                        isDomestic
                          ? 'PAN or Tax Reference *'
                          : 'Tax ID Number *'
                      }
                    >
                      <input
                        className={fieldClassName}
                        placeholder={
                          isDomestic ? 'PAN or tax reference' : 'Tax ID number'
                        }
                        value={form.taxIdNumber}
                        onChange={(event) =>
                          updateField('taxIdNumber', event.target.value)
                        }
                      />
                    </FormField>
                  </div>

                  <div className="mt-6 rounded-[10px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">
                      Policy and Consent
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600"
                          checked={form.noRefundAccepted}
                          onChange={(event) =>
                            updateField(
                              'noRefundAccepted',
                              event.target.checked
                            )
                          }
                        />
                        <span>
                          I understand that festival tickets are non-refundable
                          by default.
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600"
                          checked={form.termsAccepted}
                          onChange={(event) =>
                            updateField('termsAccepted', event.target.checked)
                          }
                        />
                        <span>
                          I accept the ticketing terms and event rules.
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600"
                          checked={form.privacyAccepted}
                          onChange={(event) =>
                            updateField('privacyAccepted', event.target.checked)
                          }
                        />
                        <span>
                          I consent to storage of attendee and compliance data
                          for invoicing, check-in, and audit purposes.
                        </span>
                      </label>
                    </div>
                  </div>
                </>
              ) : null}
              {step === 'review' ? (
                <div>
                  {/* Profile snapshot (photo + LinkedIn) */}
                  {safePhotoPreview || form.linkedinUrl ? (
                    <div className="mb-5 flex items-center gap-4 rounded-[10px] border border-slate-200 bg-slate-50 px-5 py-4">
                      {safePhotoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={safePhotoPreview}
                          alt="Profile"
                          className="h-14 w-14 shrink-0 rounded-[10px] object-cover ring-2 ring-slate-200"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-slate-900">
                          {form.fullName}
                        </p>
                        {form.linkedinUrl ? (
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[#2563eb]">
                            <Linkedin className="h-3.5 w-3.5 shrink-0" />
                            {form.linkedinUrl}
                          </p>
                        ) : null}
                        {photoUploadStatus === 'done' ? (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
                            <Check className="h-3 w-3" /> Photo saved
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-2xl font-black text-slate-900">
                        Order Summary
                      </p>
                      <span className="rounded-[10px] bg-[#dbeafe] px-4 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#2563eb]">
                        {preview.badgeLabel}
                      </span>
                    </div>
                    <div className="mt-6 space-y-4 text-slate-600">
                      <div className="flex items-center justify-between gap-4">
                        <span>Payment Channel</span>
                        <span className="font-semibold text-slate-900">
                          {pricing.paymentGatewayLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Invoice Treatment</span>
                        <span className="font-semibold text-slate-900">
                          {pricing.invoiceTreatment}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-xl font-black text-slate-900">
                      What&apos;s included:
                    </p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {REVIEW_INCLUDED_ITEMS.map((item) => (
                        <div
                          key={item.title}
                          className="flex items-start gap-3"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500 text-emerald-600">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p className="text-base font-black text-slate-900">
                              {item.title}
                            </p>
                            <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 rounded-[10px] bg-[#eff6ff] px-5 py-4 text-sm leading-relaxed text-[#1d4ed8]">
                    <div className="flex gap-3">
                      <Info className="mt-0.5 h-5 w-5 shrink-0" />
                      <p>{pricing.paymentMessage}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 'payment' ? (
                <div className="py-2 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]">
                    <LoaderCircle
                      className={`h-8 w-8 ${
                        paymentSession.status === 'loading'
                          ? 'animate-spin'
                          : ''
                      }`}
                    />
                  </div>
                  <h4 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    Initialising Secure Payment
                  </h4>
                  <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-slate-500 sm:text-lg">
                    {paymentSession.status === 'ready'
                      ? `Your ${pricing.paymentGatewayLabel.toLowerCase()} is ready.`
                      : `Please wait while we connect to the ${pricing.paymentGatewayLabel.toLowerCase()}.`}
                  </p>

                  <div className="mx-auto mt-6 max-w-sm rounded-[10px] border border-slate-200 bg-slate-50 p-5 text-left">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
                      <span>Order ID</span>
                      <span className="font-mono text-slate-900">
                        {paymentSession.orderId || 'Preparing...'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={launchPreparedCheckout}
                    disabled={paymentSession.status !== 'ready' || submitting}
                    className="mx-auto mt-6 inline-flex min-w-[280px] items-center justify-center rounded-[10px] bg-[#17203a] px-8 py-4 text-lg font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[320px] sm:text-xl"
                  >
                    {submitting ? 'Opening Razorpay...' : 'Pay Now'}
                  </button>

                  <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Secured by Razorpay
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              {step === 'details' ? (
                <>
                  <button
                    type="button"
                    onClick={closeTicketModal}
                    className="inline-flex items-center gap-2 rounded-[10px] px-2 py-2 text-lg font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={goToReviewStep}
                    className="inline-flex items-center gap-3 rounded-[10px] bg-[#17203a] px-9 py-4 text-lg font-black text-white transition hover:opacity-95"
                  >
                    Review Order
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}

              {step === 'review' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="inline-flex items-center gap-2 rounded-[10px] px-2 py-2 text-lg font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={preparePaymentStep}
                    className="inline-flex items-center gap-3 rounded-[10px] bg-[#17203a] px-9 py-4 text-lg font-black text-white transition hover:opacity-95"
                  >
                    Proceed to Payment
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}

              {step === 'payment' ? (
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  disabled={paymentSession.status === 'loading'}
                  className="inline-flex items-center gap-2 rounded-[10px] px-2 py-2 text-lg font-semibold text-slate-500 transition hover:text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
