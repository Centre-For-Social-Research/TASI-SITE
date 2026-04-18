'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AdminAlert,
  AdminSectionHeading,
  AdminStatCard,
} from '@/components/admin/admin-ui';
import AdminPageIntro from '@/components/admin/admin-page-intro';

function formatMoney(minor, currency) {
  const value = Number(minor || 0) / 100;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatValue(value, fallback = '—') {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
        {formatValue(value)}
      </p>
    </div>
  );
}

const TICKET_STATUS_MAP = {
  confirmed: {
    label: 'Payment Confirmed',
    classes:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  checked_in: {
    label: 'Checked In',
    classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  pending: {
    label: 'Awaiting Payment',
    classes:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  },
};

function TicketStatusBadge({ ticket }) {
  const cfg = TICKET_STATUS_MAP[ticket.status] ?? {
    label: ticket.status,
    classes:
      'bg-zinc-100 text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${cfg.classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

function PaymentStatusNote({ ticket }) {
  if (ticket.status === 'cancelled') {
    const hasOrder = Boolean(ticket.razorpay_order_id);
    const hasPayment = Boolean(ticket.razorpay_payment_id);
    const reason = !hasOrder
      ? 'No payment order was created — checkout may have been abandoned.'
      : !hasPayment
        ? 'A Razorpay order exists but no payment was captured. The buyer may have closed the payment window.'
        : 'Payment was captured but ticket was later cancelled or refunded.';
    return (
      <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
        {reason}
      </p>
    );
  }
  if (ticket.status === 'pending') {
    const hasOrder = Boolean(ticket.razorpay_order_id);
    const reason = hasOrder
      ? 'Razorpay order created — waiting for payment confirmation webhook.'
      : 'No payment order created yet.';
    return (
      <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
        {reason}
      </p>
    );
  }
  return null;
}

export default function TicketingAdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  const handleResendConfirmation = async (ticket) => {
    setResendingId(ticket.id);
    try {
      const response = await fetch(
        `/api/admin/tickets/${ticket.id}/resend-confirmation`,
        {
          method: 'POST',
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to resend confirmation.');
      }
      toast.success(
        `Confirmation email with QR code resent to ${ticket.user?.email}.`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to resend confirmation.'
      );
    } finally {
      setResendingId(null);
    }
  };

  async function loadTickets(nextSearch = '') {
    setLoading(true);
    try {
      const query = nextSearch
        ? `?search=${encodeURIComponent(nextSearch)}`
        : '';
      const response = await fetch(`/api/admin/tickets${query}`, {
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to load festival tickets.');
      }
      setTickets(data.tickets || []);
      setExpandedTicketId((current) =>
        data.tickets?.some((ticket) => ticket.id === current) ? current : null
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to load festival tickets.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  const stats = useMemo(() => {
    const domesticConfirmed = tickets.filter(
      (ticket) =>
        ticket.payment_stream === 'domestic' && ticket.status !== 'pending'
    );
    const internationalConfirmed = tickets.filter(
      (ticket) =>
        ticket.payment_stream === 'fcra' && ticket.status !== 'pending'
    );

    return {
      totalTickets: tickets.length,
      domesticRevenueMinor: domesticConfirmed.reduce(
        (total, ticket) => total + Number(ticket.total_amount_minor || 0),
        0
      ),
      internationalRevenueMinor: internationalConfirmed.reduce(
        (total, ticket) => total + Number(ticket.total_amount_minor || 0),
        0
      ),
      checkedIn: tickets.filter((ticket) => ticket.status === 'checked_in')
        .length,
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Ticketing"
        title="Festival ticketing dashboard"
        description="Monitor domestic and FCRA sales, attendee state, and compliance-facing ticket records from a cleaner revenue operations view."
        chips={['Sales summary', 'Buyer records', 'Resend confirmations']}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <AdminStatCard
          label="Festival Tickets"
          value={stats.totalTickets}
          tone="accent"
        />
        <AdminStatCard
          label="Domestic Revenue"
          value={formatMoney(stats.domesticRevenueMinor, 'INR')}
          tone="success"
        />
        <AdminStatCard
          label="FCRA Revenue"
          value={formatMoney(stats.internationalRevenueMinor, 'USD')}
          tone="warning"
        />
        <AdminStatCard label="Checked In" value={stats.checkedIn} tone="info" />
      </div>

      <section className="rounded-[10px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <AdminSectionHeading
            eyebrow="Attendees"
            title="Festival ticket records"
            description="Search by ticket number, attendee name, or attendee email."
          />
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void loadTickets(search);
              }}
              placeholder="Search by name, email, or ticket number"
              className="h-12 rounded-[10px] border border-zinc-200 bg-zinc-50 px-4 text-sm dark:border-white/[0.06] dark:bg-white/[0.06]"
            />
            <button
              type="button"
              onClick={() => void loadTickets(search)}
              className="rounded-full bg-rc-primary px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-rc-secondary"
            >
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            Loading festival tickets...
          </p>
        ) : tickets.length === 0 ? (
          <AdminAlert
            title="No festival tickets found"
            description="Festival ticket records will appear here once purchases begin through the registration page."
            tone="info"
            className="mt-6"
          />
        ) : (
          <div className="mt-6 grid gap-4">
            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.04]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTicketId((current) =>
                      current === ticket.id ? null : ticket.id
                    )
                  }
                  className="flex w-full flex-col gap-2 text-left md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <p className="text-sm font-black text-zinc-900 dark:text-white">
                        {ticket.ticket_number}
                      </p>
                      <TicketStatusBadge ticket={ticket} />
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {ticket.user?.full_name} · {ticket.user?.email}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      {ticket.ticket_type} · {ticket.payment_stream}
                    </p>
                    <PaymentStatusNote ticket={ticket} />
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 md:text-right">
                    <p>
                      {formatMoney(ticket.total_amount_minor, ticket.currency)}
                    </p>
                    <p className="mt-1">
                      {ticket.invoice_number || 'Invoice pending'}
                    </p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                      {expandedTicketId === ticket.id
                        ? 'Hide details'
                        : 'View details'}
                    </p>
                  </div>
                </button>

                {expandedTicketId === ticket.id ? (
                  <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-white/[0.06]">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={
                          resendingId === ticket.id ||
                          (ticket.status !== 'confirmed' &&
                            ticket.status !== 'checked_in')
                        }
                        onClick={() => void handleResendConfirmation(ticket)}
                        className="inline-flex items-center gap-2 rounded-full bg-rc-primary px-5 py-2 text-xs font-black uppercase tracking-[0.14em] text-rc-secondary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {resendingId === ticket.id
                          ? 'Sending…'
                          : 'Resend QR / Confirmation'}
                      </button>
                      {ticket.status !== 'confirmed' &&
                        ticket.status !== 'checked_in' && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Only confirmed or checked-in tickets can be resent.
                          </span>
                        )}
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                      <div className="space-y-4">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">
                          Buyer Details
                        </p>
                        <DetailItem
                          label="Full Name"
                          value={ticket.user?.full_name}
                        />
                        <DetailItem label="Email" value={ticket.user?.email} />
                        <DetailItem label="Phone" value={ticket.user?.phone} />
                        <DetailItem
                          label="Organisation"
                          value={ticket.user?.organization}
                        />
                        <DetailItem
                          label="Job Title"
                          value={ticket.user?.job_title}
                        />
                        <DetailItem
                          label="Country"
                          value={ticket.user?.country}
                        />
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">
                          Billing Address
                        </p>
                        <DetailItem
                          label="Billing Name"
                          value={ticket.user?.billing_name}
                        />
                        <DetailItem
                          label="Billing Email"
                          value={ticket.user?.billing_email}
                        />
                        <DetailItem
                          label="Billing Phone"
                          value={ticket.user?.billing_phone}
                        />
                        <DetailItem
                          label="Billing Address"
                          value={[
                            ticket.user?.billing_address_line1,
                            ticket.user?.billing_address_line2,
                            ticket.user?.billing_city,
                            ticket.user?.billing_state_or_province,
                            ticket.user?.billing_postal_code,
                            ticket.user?.billing_country,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        />
                        <DetailItem
                          label="Tax ID Number"
                          value={ticket.user?.tax_id_number}
                        />
                        <DetailItem label="GSTIN" value={ticket.user?.gstin} />
                        <DetailItem
                          label="Passport / National ID"
                          value={ticket.user?.passport_or_national_id}
                        />
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">
                          Payment IDs
                        </p>
                        <DetailItem
                          label="Ticket Status"
                          value={ticket.status}
                        />
                        <DetailItem
                          label="Ticket Type"
                          value={ticket.ticket_type}
                        />
                        <DetailItem
                          label="Payment Stream"
                          value={ticket.payment_stream}
                        />
                        <DetailItem
                          label="Total Amount"
                          value={formatMoney(
                            ticket.total_amount_minor,
                            ticket.currency
                          )}
                        />
                        <DetailItem
                          label="Invoice Number"
                          value={ticket.invoice_number}
                        />
                        <DetailItem
                          label="Badge Number"
                          value={ticket.badge_number}
                        />
                        <DetailItem
                          label="Razorpay Order ID"
                          value={ticket.razorpay_order_id}
                        />
                        <DetailItem
                          label="Razorpay Payment ID"
                          value={ticket.razorpay_payment_id}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
