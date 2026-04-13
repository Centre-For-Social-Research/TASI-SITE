'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAlert } from '@/components/admin/admin-ui';

function formatCurrency(amountPaise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((amountPaise || 0) / 100);
}

function getTicketSurface(pattern) {
  if (pattern === 'zigzag') {
    return 'bg-[linear-gradient(180deg,rgba(255,106,0,0.1),rgba(79,0,111,0.35)),repeating-linear-gradient(60deg,#ff5a00_0_18px,#8f1239_18px_34px,#ff5a00_34px_52px)]';
  }

  if (pattern === 'rings') {
    return 'bg-[radial-gradient(circle_at_20%_20%,rgba(255,159,28,0.75)_0_18%,transparent_18%_100%),radial-gradient(circle_at_72%_28%,rgba(255,159,28,0.68)_0_18%,transparent_18%_100%),radial-gradient(circle_at_50%_65%,rgba(255,159,28,0.6)_0_18%,transparent_18%_100%),linear-gradient(180deg,#5c1d67_0%,#7c114f_46%,#a20f4a_100%)]';
  }

  return 'bg-[linear-gradient(180deg,rgba(26,10,90,0.35),rgba(93,0,102,0.5)),repeating-linear-gradient(0deg,#6d1f59_0_18px,#8d164b_18px_36px,#46137d_36px_54px,#8d164b_54px_72px)]';
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

function EmptyAttendee() {
  return { fullName: '', email: '', phone: '' };
}

export default function ReceptionTicketing2026() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [donationAmountInr, setDonationAmountInr] = useState('');
  const [buyer, setBuyer] = useState({ fullName: '', email: '', phone: '' });
  const [attendees, setAttendees] = useState([EmptyAttendee()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/events', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data?.error || 'Unable to load 2026 reception tickets.'
          );
        }

        if (!active) return;
        setEvents(Array.isArray(data.events) ? data.events : []);
        setDemoMode(Boolean(data.demoMode));
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load 2026 reception tickets.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadEvents();
    return () => {
      active = false;
    };
  }, []);

  const activeEvent = events[0] || null;
  const ticketTypes = useMemo(
    () => activeEvent?.ticketTypes || [],
    [activeEvent]
  );
  const selectedTier =
    ticketTypes.find((ticketType) => ticketType.id === selectedTierId) || null;

  useEffect(() => {
    if (!ticketTypes.length) return;
    if (!selectedTierId) {
      setSelectedTierId(ticketTypes[0].id);
    }
  }, [selectedTierId, ticketTypes]);

  useEffect(() => {
    setAttendees((current) => {
      const next = [...current];
      while (next.length < quantity) next.push(EmptyAttendee());
      return next.slice(0, quantity);
    });
  }, [quantity]);

  const checkoutLabel = useMemo(() => {
    if (!selectedTier) return 'Register now';
    if (selectedTier.ticketMode === 'free') return 'Reserve ticket';
    if (selectedTier.ticketMode === 'donation') return 'Contribute and book';
    return 'Register now';
  }, [selectedTier]);

  async function handleCheckout(event) {
    event.preventDefault();
    if (!activeEvent || !selectedTier) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        eventId: activeEvent.id,
        buyer,
        ticketSelections: [
          {
            ticketTypeId: selectedTier.id,
            quantity,
            ...(selectedTier.ticketMode === 'donation'
              ? { donationAmountInr: Number(donationAmountInr) }
              : {}),
            attendees: attendees.slice(0, quantity),
          },
        ],
      };

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to create your booking.');
      }

      if (data.freeOrder) {
        router.push(
          `/tickets/success?order=${encodeURIComponent(data.orderCode)}&free=1`
        );
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay checkout could not be loaded.');
      }

      const razorpay = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amountPaise,
        currency: data.currency || 'INR',
        name: 'TASI 2026',
        description: activeEvent.title,
        order_id: data.razorpayOrderId,
        prefill: {
          name: buyer.fullName,
          email: buyer.email,
          contact: buyer.phone,
        },
        theme: {
          color: '#3f0071',
        },
        handler: async (paymentResult) => {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
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

          router.push(
            `/tickets/success?order=${encodeURIComponent(data.orderCode)}`
          );
        },
      });

      razorpay.open();
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Unable to complete your booking.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg">
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-rc-secondary">
            TASI 2026 Receptions
          </p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl">
            Choose your ticket
          </h2>
          <p className="mt-5 text-body-lg leading-relaxed text-stone-700 dark:text-slate-300">
            Book your 2026 reception access with a tier that fits your context.
            Standard supports your participation, Supporter extends that
            support, and Community keeps the experience accessible.
          </p>
          {demoMode ? (
            <p className="mt-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Demo preview mode is active because Supabase ticketing credentials
              are not configured in this local environment yet.
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-12 rounded-[10px] border border-stone-200 bg-white p-8 text-center text-sm text-stone-500 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Loading 2026 reception ticketing…
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-12">
            <AdminAlert
              title="Ticketing unavailable"
              description={error}
              tone="danger"
            />
          </div>
        ) : null}

        {!loading && !error && !activeEvent ? (
          <div className="mt-12 rounded-[10px] border border-stone-200 bg-white p-8 text-center shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-lg font-bold text-stone-900 dark:text-white">
              2026 reception tickets will appear here once the first event is
              published.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
              The booking interface is live and ready for your admin team to
              publish the first reception event.
            </p>
          </div>
        ) : null}

        {!loading && !error && activeEvent ? (
          <>
            <div className="mt-10 text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-rc-secondary">
                {activeEvent.heroLabel || 'Featured Reception'}
              </p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                {activeEvent.title}
              </h3>
              <p className="mt-3 text-sm text-stone-600 dark:text-slate-300">
                {activeEvent.venue} ·{' '}
                {new Date(activeEvent.startsAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              {ticketTypes.map((ticketType) => {
                const isSelected = selectedTierId === ticketType.id;
                const available =
                  ticketType.availability?.availableQuantity || 0;

                return (
                  <article key={ticketType.id} className="text-center">
                    <div
                      className={`overflow-hidden rounded-[10px] border-2 ${
                        isSelected
                          ? 'border-rc-primary shadow-[0_22px_60px_rgba(53,2,101,0.28)]'
                          : 'border-stone-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-slate-700'
                      }`}
                    >
                      <div
                        className={`relative h-[420px] px-7 py-6 text-left text-white ${getTicketSurface(ticketType.badgePattern)}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex h-3 w-10 rounded-full bg-white/90" />
                          <span className="inline-flex h-3 w-10 rounded-full bg-white/90" />
                        </div>
                        <div className="absolute inset-x-7 bottom-20">
                          <div className="mb-3 h-[2px] w-40 bg-white/70" />
                          <p className="text-5xl font-black tracking-tight">
                            {ticketType.name}
                          </p>
                          <div className="mt-3 h-[2px] w-40 bg-white/70" />
                        </div>
                        <div className="absolute bottom-6 left-7 text-lg font-black leading-none">
                          Rights
                          <br />
                          Con 26
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTierId(ticketType.id)}
                      className="mt-6 inline-flex rounded-full bg-rc-primary px-9 py-3 text-sm font-black uppercase tracking-[0.12em] text-rc-secondary transition hover:opacity-90"
                    >
                      Register now
                    </button>

                    <h4 className="mt-6 text-3xl font-black tracking-tight text-stone-900 dark:text-white">
                      {ticketType.name}
                    </h4>
                    <p className="mt-4 text-base font-semibold text-stone-700 dark:text-slate-200">
                      {ticketType.ticketMode === 'free'
                        ? 'Free'
                        : ticketType.ticketMode === 'donation'
                          ? `From ${formatCurrency(ticketType.minDonationPaise)}`
                          : formatCurrency(ticketType.pricePaise)}
                    </p>
                    <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                      {ticketType.shortDescription || ticketType.description}
                    </p>
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                      {available > 0 ? `${available} remaining` : 'Sold out'}
                    </p>
                  </article>
                );
              })}
            </div>

            {selectedTier ? (
              <form
                onSubmit={handleCheckout}
                className="mx-auto mt-16 max-w-5xl rounded-[10px] border border-stone-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 md:p-8"
              >
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-rc-secondary">
                      Booking Summary
                    </p>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-stone-900 dark:text-white">
                      {selectedTier.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                      {selectedTier.shortDescription ||
                        selectedTier.description}
                    </p>

                    <label className="mt-6 block text-sm font-semibold text-stone-700 dark:text-slate-200">
                      Quantity
                      <input
                        type="number"
                        min="1"
                        max={selectedTier.perOrderLimit}
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(
                            Math.max(1, Number(event.target.value) || 1)
                          )
                        }
                        className="mt-2 h-12 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>

                    {selectedTier.ticketMode === 'donation' ? (
                      <label className="mt-4 block text-sm font-semibold text-stone-700 dark:text-slate-200">
                        Donation amount (INR)
                        <input
                          type="number"
                          min={Math.ceil(
                            (selectedTier.minDonationPaise || 0) / 100
                          )}
                          step="1"
                          value={donationAmountInr}
                          onChange={(event) =>
                            setDonationAmountInr(event.target.value)
                          }
                          className="mt-2 h-12 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </label>
                    ) : null}

                    <div className="mt-6 rounded-[10px] border border-stone-200 bg-stone-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                        Payable Now
                      </p>
                      <p className="mt-2 text-2xl font-black text-stone-900 dark:text-white">
                        {selectedTier.ticketMode === 'free'
                          ? 'Free'
                          : selectedTier.ticketMode === 'donation'
                            ? donationAmountInr
                              ? formatCurrency(
                                  Number(donationAmountInr) * 100 * quantity
                                )
                              : `From ${formatCurrency((selectedTier.minDonationPaise || 0) * quantity)}`
                            : formatCurrency(
                                (selectedTier.pricePaise || 0) * quantity
                              )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-rc-secondary">
                        Buyer Details
                      </p>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <input
                          placeholder="Full name"
                          value={buyer.fullName}
                          onChange={(event) =>
                            setBuyer((current) => ({
                              ...current,
                              fullName: event.target.value,
                            }))
                          }
                          className="h-12 rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                        <input
                          placeholder="Phone"
                          value={buyer.phone}
                          onChange={(event) =>
                            setBuyer((current) => ({
                              ...current,
                              phone: event.target.value,
                            }))
                          }
                          className="h-12 rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                        <input
                          placeholder="Email"
                          type="email"
                          value={buyer.email}
                          onChange={(event) =>
                            setBuyer((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          className="h-12 rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-rc-secondary">
                        Attendee Details
                      </p>
                      <div className="mt-4 space-y-4">
                        {attendees.slice(0, quantity).map((attendee, index) => (
                          <div
                            key={index}
                            className="rounded-[10px] border border-stone-200 bg-stone-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                          >
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                              Ticket {index + 1}
                            </p>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                              <input
                                placeholder="Attendee name"
                                value={attendee.fullName}
                                onChange={(event) =>
                                  setAttendees((current) =>
                                    current.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...item,
                                            fullName: event.target.value,
                                          }
                                        : item
                                    )
                                  )
                                }
                                className="h-11 rounded-[10px] border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                              />
                              <input
                                placeholder="Attendee email"
                                type="email"
                                value={attendee.email}
                                onChange={(event) =>
                                  setAttendees((current) =>
                                    current.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, email: event.target.value }
                                        : item
                                    )
                                  )
                                }
                                className="h-11 rounded-[10px] border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                              />
                              <input
                                placeholder="Attendee phone"
                                value={attendee.phone}
                                onChange={(event) =>
                                  setAttendees((current) =>
                                    current.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, phone: event.target.value }
                                        : item
                                    )
                                  )
                                }
                                className="h-11 rounded-[10px] border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-stone-200 pt-6 dark:border-slate-700">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center rounded-full bg-rc-primary px-8 py-3 text-sm font-black uppercase tracking-[0.14em] text-rc-secondary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? 'Processing…' : checkoutLabel}
                      </button>
                      <p className="text-xs leading-relaxed text-stone-500 dark:text-slate-400">
                        Free tickets are issued immediately. Paid and supporter
                        tickets continue to Razorpay checkout and are confirmed
                        after signature verification.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
