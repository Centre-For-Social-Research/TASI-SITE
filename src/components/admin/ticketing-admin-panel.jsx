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

export default function TicketingAdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", tone: "default" });

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
            Loading festival tickets…
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
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
