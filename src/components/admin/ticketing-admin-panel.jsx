"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminAlert,
  AdminSectionHeading,
  AdminStatCard,
  AdminToast,
} from "@/components/admin/admin-ui";

function formatMoney(minor, currency) {
  const value = Number(minor || 0) / 100;
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatValue(value, fallback = "—") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {formatValue(value)}
      </p>
    </div>
  );
}

export default function TicketingAdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", tone: "default" });
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  async function loadTickets(nextSearch = "") {
    setLoading(true);
    try {
      const query = nextSearch ? `?search=${encodeURIComponent(nextSearch)}` : "";
      const response = await fetch(`/api/admin/tickets${query}`, {
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Unable to load festival tickets.");
      }
      setTickets(data.tickets || []);
      setExpandedTicketId((current) =>
        data.tickets?.some((ticket) => ticket.id === current) ? current : null,
      );
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Unable to load festival tickets.",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  const stats = useMemo(() => {
    const domesticConfirmed = tickets.filter(
      (ticket) => ticket.payment_stream === "domestic" && ticket.status !== "pending",
    );
    const internationalConfirmed = tickets.filter(
      (ticket) => ticket.payment_stream === "fcra" && ticket.status !== "pending",
    );

    return {
      totalTickets: tickets.length,
      domesticRevenueMinor: domesticConfirmed.reduce(
        (total, ticket) => total + Number(ticket.total_amount_minor || 0),
        0,
      ),
      internationalRevenueMinor: internationalConfirmed.reduce(
        (total, ticket) => total + Number(ticket.total_amount_minor || 0),
        0,
      ),
      checkedIn: tickets.filter((ticket) => ticket.status === "checked_in").length,
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      <AdminSectionHeading
        eyebrow="Ticketing"
        title="Festival ticketing dashboard"
        description="Monitor PRD-aligned domestic and FCRA ticket sales, attendee state, and compliance-facing ticket records."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <AdminStatCard label="Festival Tickets" value={stats.totalTickets} tone="accent" />
        <AdminStatCard
          label="Domestic Revenue"
          value={formatMoney(stats.domesticRevenueMinor, "INR")}
          tone="success"
        />
        <AdminStatCard
          label="FCRA Revenue"
          value={formatMoney(stats.internationalRevenueMinor, "USD")}
          tone="warning"
        />
        <AdminStatCard label="Checked In" value={stats.checkedIn} tone="info" />
      </div>

      <AdminToast
        message={toast.message}
        tone={toast.tone}
        onDismiss={() => setToast({ message: "", tone: "default" })}
      />

      <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
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
              placeholder="Search festival tickets"
              className="h-12 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800"
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
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
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
                className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTicketId((current) =>
                      current === ticket.id ? null : ticket.id,
                    )
                  }
                  className="flex w-full flex-col gap-2 text-left md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {ticket.ticket_number}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {ticket.user?.full_name} · {ticket.user?.email}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      {ticket.ticket_type} · {ticket.payment_stream} · {ticket.status}
                    </p>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 md:text-right">
                    <p>{formatMoney(ticket.total_amount_minor, ticket.currency)}</p>
                    <p className="mt-1">{ticket.invoice_number || "Invoice pending"}</p>
                    <p className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                      {expandedTicketId === ticket.id ? "Hide details" : "View details"}
                    </p>
                  </div>
                </button>

                {expandedTicketId === ticket.id ? (
                  <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <div className="grid gap-5 md:grid-cols-3">
                      <div className="space-y-4">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          Buyer Details
                        </p>
                        <DetailItem label="Full Name" value={ticket.user?.full_name} />
                        <DetailItem label="Email" value={ticket.user?.email} />
                        <DetailItem label="Phone" value={ticket.user?.phone} />
                        <DetailItem label="Organisation" value={ticket.user?.organization} />
                        <DetailItem label="Job Title" value={ticket.user?.job_title} />
                        <DetailItem label="Country" value={ticket.user?.country} />
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          Billing Address
                        </p>
                        <DetailItem label="Billing Name" value={ticket.user?.billing_name} />
                        <DetailItem label="Billing Email" value={ticket.user?.billing_email} />
                        <DetailItem label="Billing Phone" value={ticket.user?.billing_phone} />
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
                            .join(", ")}
                        />
                        <DetailItem label="Tax ID Number" value={ticket.user?.tax_id_number} />
                        <DetailItem label="GSTIN" value={ticket.user?.gstin} />
                        <DetailItem
                          label="Passport / National ID"
                          value={ticket.user?.passport_or_national_id}
                        />
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          Payment IDs
                        </p>
                        <DetailItem label="Ticket Status" value={ticket.status} />
                        <DetailItem label="Ticket Type" value={ticket.ticket_type} />
                        <DetailItem label="Payment Stream" value={ticket.payment_stream} />
                        <DetailItem
                          label="Total Amount"
                          value={formatMoney(ticket.total_amount_minor, ticket.currency)}
                        />
                        <DetailItem label="Invoice Number" value={ticket.invoice_number} />
                        <DetailItem label="Badge Number" value={ticket.badge_number} />
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
