"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  LoaderCircle,
  X,
} from "lucide-react";
import { AdminAlert } from "@/components/admin/admin-ui";
import { GlowCard } from "@/components/ui/spotlight-card";
import { festivalCreateOrderSchema } from "@/lib/festival-ticketing-validation";

const COUNTRY_OPTIONS = [
  { code: "IN", label: "India" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "SG", label: "Singapore" },
  { code: "DE", label: "Germany" },
  { code: "AU", label: "Australia" },
  { code: "CA", label: "Canada" },
];

const INITIAL_FORM = {
  fullName: "",
  email: "",
  confirmEmail: "",
  organization: "",
  jobTitle: "",
  country: "IN",
  phone: "",
  billingName: "",
  billingEmail: "",
  billingPhone: "",
  billingAddressLine1: "",
  billingAddressLine2: "",
  billingCity: "",
  billingStateOrProvince: "",
  billingPostalCode: "",
  billingCountry: "IN",
  taxIdNumber: "",
  gstin: "",
  passportOrNationalId: "",
  noRefundAccepted: false,
  termsAccepted: false,
  privacyAccepted: false,
};

const FESTIVAL_PASS_OPTIONS = [
  {
    label: "Domestic",
    amount: "INR 11,800",
    title: "Domestic",
    description:
      "For attendees based in India, with GST-ready invoicing and domestic Razorpay routing.",
    country: "IN",
    badgePattern: "mosaic",
  },
  {
    label: "International",
    amount: "USD 200",
    title: "International",
    description:
      "For attendees joining from outside India, with export invoice support and FCRA-only routing.",
    country: "US",
    badgePattern: "rings",
  },
];

const INCLUDED_ROWS = [
  {
    title: "2 days of conference programming and 3 receptions",
    domestic: true,
    international: true,
  },
  {
    title: "Confirmed festival pass with QR-based venue check-in",
    domestic: true,
    international: true,
  },
  {
    title: "Ticket PDF, attendee badge PDF, and invoice PDF after payment",
    domestic: true,
    international: true,
  },
  {
    title: "Domestic GST invoice support",
    domestic: true,
    international: false,
  },
  {
    title: "Export invoice and FCRA-compliant payment routing",
    domestic: false,
    international: true,
  },
];

const REVIEW_INCLUDED_ITEMS = {
  domestic: [
    "2-Day Access",
    "Conference Kit",
    "Digital Badge",
    "3 Receptions",
    "Networking App",
    "Tax Invoice",
  ],
  international: [
    "2-Day Access",
    "Conference Kit",
    "Digital Badge",
    "3 Receptions",
    "Networking App",
    "Export Invoice",
  ],
};

function getTicketPreview(country) {
  if (country === "IN") {
    return {
      label: "Domestic Pass",
      amount: "INR 11,800",
      description:
        "Includes 18% GST and routes exclusively to the domestic NGO Razorpay account.",
      complianceLabel: "GST invoice required",
      badgeLabel: "DOMESTIC PASS",
    };
  }

  return {
    label: "International Pass",
    amount: "USD 200",
    description:
      "Zero-rated export invoice and exclusive routing to the FCRA Razorpay account.",
    complianceLabel: "Export invoice and identity record required",
    badgeLabel: "INTERNATIONAL PASS",
  };
}

function getTicketBreakdown(country) {
  if (country === "IN") {
    return {
      baseLabel: "Base Price",
      baseAmount: "₹10,000",
      taxLabel: "GST Treatment",
      taxAmount: "₹1,800 (18%)",
      totalAmount: "₹11,800",
      paymentMessage:
        "By proceeding, you confirm that your country of residence is India. This determines the regulatory channel for your payment.",
      paymentGatewayLabel: "Domestic payment gateway",
    };
  }

  return {
    baseLabel: "Base Price",
    baseAmount: "$200",
    taxLabel: "GST Treatment",
    taxAmount: "Zero-rated export",
    totalAmount: "$200",
    paymentMessage:
      "By proceeding, you confirm that your country of residence is outside India. This determines the regulatory channel for your payment.",
    paymentGatewayLabel: "International payment gateway",
  };
}

function getTicketSurface(pattern) {
  if (pattern === "mosaic") {
    return "bg-[linear-gradient(180deg,rgba(46,6,89,0.15),rgba(77,7,106,0.72)),linear-gradient(45deg,#b12f2a_12.5%,transparent_12.5%_25%,#cf3f1d_25%_37.5%,transparent_37.5%_50%,#70206b_50%_62.5%,transparent_62.5%_75%,#f08b18_75%_87.5%,transparent_87.5%),linear-gradient(-45deg,#762071_12.5%,transparent_12.5%_25%,#cf3f1d_25%_37.5%,transparent_37.5%_50%,#f08b18_50%_62.5%,transparent_62.5%_75%,#932047_75%_87.5%,transparent_87.5%),linear-gradient(180deg,#60207f_0%,#7d1249_54%,#3a0a6c_100%)] bg-[length:72px_72px,72px_72px,72px_72px,100%_100%]";
  }

  return "bg-[radial-gradient(circle_at_20%_20%,rgba(255,159,28,0.75)_0_18%,transparent_18%_100%),radial-gradient(circle_at_72%_28%,rgba(255,159,28,0.68)_0_18%,transparent_18%_100()),radial-gradient(circle_at_50%_65%,rgba(255,159,28,0.6)_0_18%,transparent_18%_100()),linear-gradient(180deg,#5c1d67_0%,#7c114f_46%,#a20f4a_100%)]";
}

function getTicketSurfaceStyle(pattern) {
  if (pattern === "rings") {
    return {
      backgroundImage:
        "radial-gradient(circle at 20% 20%, rgba(255,159,28,0.75) 0 18%, transparent 18% 100%), radial-gradient(circle at 72% 28%, rgba(255,159,28,0.68) 0 18%, transparent 18% 100%), radial-gradient(circle at 50% 65%, rgba(255,159,28,0.6) 0 18%, transparent 18% 100%), linear-gradient(180deg, #5c1d67 0%, #7c114f 46%, #a20f4a 100%)",
      backgroundColor: "#7c114f",
    };
  }

  return undefined;
}

function getSelectionForCountry(country) {
  return String(country || "").trim().toUpperCase() === "IN" ? "IN" : "US";
}

function getOptionForSelection(selection) {
  return FESTIVAL_PASS_OPTIONS.find((option) => option.country === selection);
}

function getFriendlyErrorMessage(errorValue, fallbackMessage) {
  if (!errorValue) return fallbackMessage;

  if (typeof errorValue === "string") {
    const trimmed = errorValue.trim();

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);

        if (Array.isArray(parsed)) {
          const firstIssue = parsed.find(
            (issue) => issue && typeof issue.message === "string",
          );

          if (firstIssue?.message) {
            return firstIssue.message;
          }
        }

        if (parsed && typeof parsed.error === "string") {
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
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
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
    { key: "details", label: "Details" },
    { key: "review", label: "Review" },
    { key: "payment", label: "Payment" },
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
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-[#2563eb] text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  isCurrent ? "text-[#2563eb]" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={`mx-4 h-px w-12 ${
                  activeIndex > index ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function FestivalTicketingSection() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedCard, setSelectedCard] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [step, setStep] = useState("details");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [paymentSession, setPaymentSession] = useState({
    status: "idle",
    orderId: "",
    amountLabel: "",
    gatewayLabel: "",
    payload: null,
  });

  const preview = useMemo(() => getTicketPreview(form.country), [form.country]);
  const pricing = useMemo(() => getTicketBreakdown(form.country), [form.country]);
  const isDomestic = String(form.country || "").trim().toUpperCase() === "IN";
  useEffect(() => {
    if (!ticketModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") closeTicketModal();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [ticketModalOpen]);

  const fieldClassName =
    "mt-2 h-12 w-full rounded-[10px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200";

  const textAreaClassName =
    "mt-2 min-h-24 w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200";

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function closeTicketModal() {
    setTicketModalOpen(false);
    setSelectedCard(null);
    setStep("details");
    setSubmitting(false);
    setPaymentSession({
      status: "idle",
      orderId: "",
      amountLabel: "",
      gatewayLabel: "",
      payload: null,
    });
    setStatus({ type: "", message: "" });
  }

  function openTicketModal(country) {
    const normalizedCountry = getSelectionForCountry(country);

    setSelectedCard(normalizedCountry);
    setTicketModalOpen(true);
    setStep("details");
    setPaymentSession({
      status: "idle",
      orderId: "",
      amountLabel: "",
      gatewayLabel: "",
      payload: null,
    });
    setStatus({ type: "", message: "" });
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
        type: "error",
        message:
          validation.error.issues[0]?.message ||
          "Please complete the required registration details.",
      });
      return;
    }

    setStatus({ type: "", message: "" });
    setStep("review");
  }

  async function preparePaymentStep() {
    const validation = festivalCreateOrderSchema.safeParse(form);

    if (!validation.success) {
      setStep("details");
      setStatus({
        type: "error",
        message:
          validation.error.issues[0]?.message ||
          "Please complete the required registration details.",
      });
      return;
    }

    setStep("payment");
    setStatus({ type: "", message: "" });
    setPaymentSession({
      status: "loading",
      orderId: "",
      amountLabel: preview.amount,
      gatewayLabel: pricing.paymentGatewayLabel,
      payload: null,
    });

    try {
      const response = await fetch("/api/tickets/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          getFriendlyErrorMessage(
            typeof data === "string" ? data : data?.error,
            "Unable to create your festival ticket.",
          ),
        );
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      setPaymentSession({
        status: "ready",
        orderId: data.razorpayOrderId,
        amountLabel: data.displayPrice || preview.amount,
        gatewayLabel: pricing.paymentGatewayLabel,
        payload: data,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to initialise secure payment.";

      setStatus({ type: "error", message });
      setPaymentSession({
        status: "error",
        orderId: "",
        amountLabel: preview.amount,
        gatewayLabel: pricing.paymentGatewayLabel,
        payload: null,
      });
    }
  }

  async function launchPreparedCheckout() {
    if (paymentSession.status !== "ready" || !paymentSession.payload) return;

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const data = paymentSession.payload;
      const razorpay = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.totalAmountMinor,
        currency: data.currency,
        name: "TASI 2026",
        description:
          data.ticketType === "domestic"
            ? "Domestic Festival Pass"
            : "International Festival Pass",
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#17203a",
        },
        handler: async (paymentResult) => {
          const verifyResponse = await fetch("/api/tickets/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticketId: data.ticketId,
              razorpayOrderId: paymentResult.razorpay_order_id,
              razorpayPaymentId: paymentResult.razorpay_payment_id,
              razorpaySignature: paymentResult.razorpay_signature,
            }),
          });
          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok) {
            throw new Error(verifyData?.error || "Payment verification failed.");
          }

          closeTicketModal();
          router.push(
            `/tickets/success?ticket=${encodeURIComponent(data.ticketNumber)}`,
          );
        },
      });

      razorpay.open();
    } catch (error) {
      setStatus({
        type: "error",
        message: getFriendlyErrorMessage(
          error,
          "Unable to complete your festival ticket purchase.",
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
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Buy your TASI 2026 festival pass
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Country of residence determines your pass type and payment stream.
          Domestic purchases include GST and route to the domestic NGO account.
          International purchases route exclusively to the FCRA account.
        </p>
      </div>

      <div className="mt-10 text-center">
        <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
          Choose your ticket
        </h3>
        <div className="mx-auto mt-4 h-[2px] w-28 bg-[#3a2c8f]" />
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-2">
        {FESTIVAL_PASS_OPTIONS.map((option) => {
          const isActive = selectedCard === option.country;
          const useReceptionStyleCard = option.country === "US";

          return (
            <article key={option.label} className="text-center">
              <button
                type="button"
                onClick={() => openTicketModal(option.country)}
                className="mx-auto block w-full max-w-[300px] text-left"
              >
                <GlowCard
                  customSize
                  glowColor={option.country === "IN" ? "orange" : "purple"}
                  className={`block overflow-hidden rounded-[10px] p-0 transition duration-300 ${
                    isActive
                      ? useReceptionStyleCard
                        ? "border-2 border-[#4c178a]"
                        : "border-[3px] border-[#4c178a]"
                      : useReceptionStyleCard
                        ? "border-2 border-stone-200"
                        : "border-[3px] border-transparent"
                  } ${isActive ? "scale-[1.01]" : "hover:-translate-y-1"}`}
                >
                  <div
                    className={`relative overflow-hidden text-white ${useReceptionStyleCard ? "h-[420px] px-7 py-6 text-left" : "h-[424px] px-8 py-5"} ${getTicketSurface(option.badgePattern)}`}
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
                        <div className="absolute inset-x-7 bottom-20 max-w-[220px]">
                          <div className="mb-3 h-[2px] w-40 bg-white/70" />
                          <p className="text-[2.65rem] font-black leading-[0.92] tracking-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
                            {option.title}
                          </p>
                          <div className="mt-3 h-[2px] w-40 bg-white/70" />
                        </div>
                        <div className="absolute bottom-6 left-7 text-lg font-black leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.28)]">
                          TASI
                          <br />
                          2026
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 text-center">
                          <div className="mx-auto mb-4 h-[2px] w-44 bg-white/80" />
                          <p className="text-5xl font-black tracking-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
                            {option.title}
                          </p>
                          <div className="mx-auto mt-4 h-[2px] w-44 bg-white/80" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#5a0d6b]/70 via-transparent to-transparent" />
                        <div className="absolute bottom-5 left-6 text-[1.6rem] font-black uppercase leading-[0.85] tracking-tight">
                          TASI 2026
                        </div>
                      </>
                    )}
                  </div>
                </GlowCard>
              </button>

              <button
                type="button"
                onClick={() => openTicketModal(option.country)}
                className={`mt-6 inline-flex rounded-[10px] px-10 py-3 text-sm font-black uppercase tracking-[0.08em] transition ${
                  isActive
                    ? "bg-[#3e0d7d] text-[#ffd400]"
                    : "bg-[#43107f] text-[#ffd400] hover:opacity-90"
                }`}
              >
                Register now
              </button>

              <h3 className="mt-6 text-[1.75rem] font-black tracking-tight text-slate-900 dark:text-white">
                {option.label}
              </h3>
              <p className="mt-3 text-base font-semibold text-slate-700 dark:text-slate-200">
                {option.amount}
              </p>
              <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {option.description}
              </p>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-amber-600">
                {isActive ? "Modal ready to continue" : "Tap register now to continue"}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-12 rounded-[10px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 md:p-8">
        <div className="text-center">
          <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
            What&apos;s included in your ticket
          </h3>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Both passes include the full TASI 2026 festival experience, while the
            invoice and compliance path changes depending on whether you register
            as a domestic or international attendee.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[10px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">
              Domestic Pass
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              India residents, INR payment, GST invoice
            </p>
            <div className="mt-5 space-y-3">
              {INCLUDED_ROWS.map((item) => (
                <div
                  key={`domestic-${item.title}`}
                  className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      item.domestic
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {item.domestic ? "Y" : "-"}
                  </span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[10px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">
              International Pass
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Non-India residents, USD payment, export invoice
            </p>
            <div className="mt-5 space-y-3">
              {INCLUDED_ROWS.map((item) => (
                <div
                  key={`international-${item.title}`}
                  className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      item.international
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {item.international ? "Y" : "-"}
                  </span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>

      {!ticketModalOpen && status.type === "error" ? (
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
          <div className="absolute inset-0" aria-hidden="true" onClick={closeTicketModal} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Event Registration"
            className="relative z-10 w-full max-w-[760px] rounded-[10px] bg-white p-6 shadow-[0_30px_120px_rgba(15,23,42,0.28)] sm:p-8 md:p-10"
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

            {status.type === "error" ? (
              <div className="mt-6">
                <AdminAlert
                  title="Festival ticketing unavailable"
                  description={status.message}
                  tone="danger"
                />
              </div>
            ) : null}

            <div className="mt-8 max-h-[65vh] overflow-y-auto pr-1">
              {step === "details" ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Full Name *">
                      <input
                        className={fieldClassName}
                        placeholder="John Doe"
                        value={form.fullName}
                        onChange={(event) => updateField("fullName", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Email Address *">
                      <input
                        className={fieldClassName}
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(event) => updateField("email", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Confirm Email *">
                      <input
                        className={fieldClassName}
                        type="email"
                        placeholder="john@example.com"
                        value={form.confirmEmail}
                        onChange={(event) =>
                          updateField("confirmEmail", event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Job Title">
                      <input
                        className={fieldClassName}
                        placeholder="e.g. Policy Manager"
                        value={form.jobTitle}
                        onChange={(event) => updateField("jobTitle", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Organisation">
                      <input
                        className={fieldClassName}
                        placeholder="Company or Institute"
                        value={form.organization}
                        onChange={(event) =>
                          updateField("organization", event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Phone (Optional)">
                      <input
                        className={fieldClassName}
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Country of Residence *">
                      <select
                        className={fieldClassName}
                        value={form.country}
                        onChange={(event) => {
                          const nextCountry = event.target.value;
                          updateField("country", nextCountry);
                          updateField("billingCountry", nextCountry);
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
                    <FormField label="Billing Name *">
                      <input
                        className={fieldClassName}
                        placeholder="Billing name"
                        value={form.billingName}
                        onChange={(event) => updateField("billingName", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Billing Email *">
                      <input
                        className={fieldClassName}
                        type="email"
                        placeholder="billing@example.com"
                        value={form.billingEmail}
                        onChange={(event) =>
                          updateField("billingEmail", event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Billing Phone *">
                      <input
                        className={fieldClassName}
                        placeholder="+91 98765 43210"
                        value={form.billingPhone}
                        onChange={(event) =>
                          updateField("billingPhone", event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Billing Country *">
                      <select
                        className={fieldClassName}
                        value={form.billingCountry}
                        onChange={(event) =>
                          updateField("billingCountry", event.target.value)
                        }
                      >
                        {COUNTRY_OPTIONS.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Billing Address Line 1 *">
                      <input
                        className={fieldClassName}
                        placeholder="Address line 1"
                        value={form.billingAddressLine1}
                        onChange={(event) =>
                          updateField("billingAddressLine1", event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Billing Address Line 2">
                      <textarea
                        className={textAreaClassName}
                        placeholder="Address line 2"
                        value={form.billingAddressLine2}
                        onChange={(event) =>
                          updateField("billingAddressLine2", event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Billing City *">
                      <input
                        className={fieldClassName}
                        placeholder="Billing city"
                        value={form.billingCity}
                        onChange={(event) => updateField("billingCity", event.target.value)}
                      />
                    </FormField>
                    <FormField label="State or Province *">
                      <input
                        className={fieldClassName}
                        placeholder="State or province"
                        value={form.billingStateOrProvince}
                        onChange={(event) =>
                          updateField("billingStateOrProvince", event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Billing Postal Code *">
                      <input
                        className={fieldClassName}
                        placeholder="Postal code"
                        value={form.billingPostalCode}
                        onChange={(event) =>
                          updateField("billingPostalCode", event.target.value)
                        }
                      />
                    </FormField>
                    <FormField
                      label={isDomestic ? "GSTIN *" : "Passport or National ID *"}
                    >
                      <input
                        className={fieldClassName}
                        placeholder={isDomestic ? "GSTIN" : "Passport or national ID"}
                        value={isDomestic ? form.gstin : form.passportOrNationalId}
                        onChange={(event) =>
                          updateField(
                            isDomestic ? "gstin" : "passportOrNationalId",
                            event.target.value,
                          )
                        }
                      />
                    </FormField>
                    <FormField
                      label={isDomestic ? "PAN or Tax Reference" : "Tax ID Number"}
                    >
                      <input
                        className={fieldClassName}
                        placeholder={
                          isDomestic ? "PAN or tax reference" : "Tax ID number"
                        }
                        value={form.taxIdNumber}
                        onChange={(event) =>
                          updateField("taxIdNumber", event.target.value)
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
                            updateField("noRefundAccepted", event.target.checked)
                          }
                        />
                        <span>
                          I understand that festival tickets are non-refundable by default.
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600"
                          checked={form.termsAccepted}
                          onChange={(event) =>
                            updateField("termsAccepted", event.target.checked)
                          }
                        />
                        <span>I accept the ticketing terms and event rules.</span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600"
                          checked={form.privacyAccepted}
                          onChange={(event) =>
                            updateField("privacyAccepted", event.target.checked)
                          }
                        />
                        <span>
                          I consent to storage of attendee and compliance data for invoicing,
                          check-in, and audit purposes.
                        </span>
                      </label>
                    </div>
                  </div>
                </>
              ) : null}
              {step === "review" ? (
                <div>
                  <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-2xl font-black text-slate-900">Order Summary</p>
                      <span className="rounded-[10px] bg-[#dbeafe] px-4 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#2563eb]">
                        {preview.badgeLabel}
                      </span>
                    </div>
                    <div className="mt-6 space-y-4 text-slate-600">
                      <div className="flex items-center justify-between gap-4">
                        <span>{pricing.baseLabel}</span>
                        <span className="font-semibold text-slate-900">
                          {pricing.baseAmount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>{pricing.taxLabel}</span>
                        <span className="font-semibold text-slate-900">
                          {pricing.taxAmount}
                        </span>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xl font-black text-slate-900">
                          Total Payable
                        </span>
                        <span className="text-4xl font-black tracking-tight text-[#2563eb]">
                          {pricing.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-xl font-black text-slate-900">
                      What&apos;s included:
                    </p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {REVIEW_INCLUDED_ITEMS[isDomestic ? "domestic" : "international"].map(
                        (item) => (
                          <div
                            key={item}
                            className="flex items-center gap-3 text-base text-slate-700"
                          >
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500 text-emerald-600">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                            <span>{item}</span>
                          </div>
                        ),
                      )}
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

              {step === "payment" ? (
                <div className="py-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]">
                    <LoaderCircle
                      className={`h-8 w-8 ${
                        paymentSession.status === "loading" ? "animate-spin" : ""
                      }`}
                    />
                  </div>
                  <h4 className="mt-8 text-4xl font-black tracking-tight text-slate-900">
                    Initialising Secure Payment
                  </h4>
                  <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-slate-500">
                    {paymentSession.status === "ready"
                      ? `Your ${pricing.paymentGatewayLabel.toLowerCase()} is ready.`
                      : `Please wait while we connect to the ${pricing.paymentGatewayLabel.toLowerCase()}.`}
                  </p>

                  <div className="mx-auto mt-8 max-w-md rounded-[10px] border border-slate-200 bg-slate-50 p-5 text-left">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
                      <span>Order ID</span>
                      <span className="font-mono text-slate-900">
                        {paymentSession.orderId || "Preparing..."}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-500">
                      <span>Amount</span>
                      <span className="font-semibold text-slate-900">
                        {paymentSession.amountLabel || preview.amount}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={launchPreparedCheckout}
                    disabled={paymentSession.status !== "ready" || submitting}
                    className="mx-auto mt-8 inline-flex min-w-[360px] items-center justify-center rounded-[10px] bg-[#17203a] px-8 py-4 text-xl font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Opening Razorpay..." : "Pay Now"}
                  </button>

                  <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Secured by Razorpay
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              {step === "details" ? (
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

              {step === "review" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setStep("details")}
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

              {step === "payment" ? (
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  disabled={paymentSession.status === "loading"}
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
