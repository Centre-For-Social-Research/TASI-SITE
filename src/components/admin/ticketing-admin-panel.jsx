"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminAlert,
  AdminSectionHeading,
  AdminStatCard,
  AdminToast,
} from "@/components/admin/admin-ui";
import { RECEPTION_TICKET_PRESETS } from "@/lib/ticketing-constants";

function defaultEventState() {
  const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return {
    slug: "tasi-2026-opening-reception",
    title: "TASI 2026 Opening Reception",
    description:
      "An intimate diplomatic evening opening the TASI 2026 reception programme.",
    venue: "New Delhi",
    startsAt,
    endsAt,
    timezone: "Asia/Kolkata",
    status: "published",
    heroLabel: "2026 Access",
    ticketTypes: RECEPTION_TICKET_PRESETS.map((preset, index) => ({
      tierKey: preset.tierKey,
      name: preset.name,
      description: preset.shortDescription,
      ticketMode: preset.ticketMode,
      pricePaise: preset.ticketMode === "paid" ? 250000 : null,
      minDonationPaise: preset.ticketMode === "donation" ? 500000 : null,
      capacity: preset.ticketMode === "community" ? 40 : 120,
      perOrderLimit: 6,
      saleStartsAt: startsAt,
      saleEndsAt: endsAt,
      isActive: true,
      displayOrder: index,
      badgePattern: preset.badgePattern,
      shortDescription: preset.shortDescription,
    })),
  };
}

export default function TicketingAdminPanel() {
  const [formState, setFormState] = useState(defaultEventState);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", tone: "default" });

  async function loadDashboard() {
    setLoading(true);
    try {
      const [eventsResponse, ordersResponse, ticketsResponse] = await Promise.all([
        fetch("/api/events", { cache: "no-store" }),
        fetch("/api/admin/ticket-orders", { cache: "no-store" }),
        fetch("/api/admin/tickets", { cache: "no-store" }),
      ]);

      const [eventsData, ordersData, ticketsData] = await Promise.all([
        eventsResponse.json().catch(() => ({})),
        ordersResponse.json().catch(() => ({})),
        ticketsResponse.json().catch(() => ({})),
      ]);

      setEvents(eventsData.events || []);
      setOrders(ordersData.orders || []);
      setTickets(ticketsData.tickets || []);
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Unable to load ticketing dashboard.",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const stats = useMemo(
    () => ({
      events: events.length,
      orders: orders.length,
      tickets: tickets.length,
      paidOrders: orders.filter((order) => order.status === "paid").length,
    }),
    [events, orders, tickets],
  );

  async function handleCreateEvent(event) {
    event.preventDefault();
    setSubmitting(true);
    setToast({ message: "", tone: "default" });

    try {
      const payload = {
        ...formState,
        startsAt: new Date(formState.startsAt).toISOString(),
        endsAt: new Date(formState.endsAt).toISOString(),
        ticketTypes: formState.ticketTypes.map((ticketType) => ({
          ...ticketType,
          saleStartsAt: ticketType.saleStartsAt
            ? new Date(ticketType.saleStartsAt).toISOString()
            : null,
          saleEndsAt: ticketType.saleEndsAt
            ? new Date(ticketType.saleEndsAt).toISOString()
            : null,
        })),
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to create ticket event.");
      }

      setToast({ message: "Ticket event created.", tone: "success" });
      setFormState(defaultEventState());
      await loadDashboard();
    } catch (error) {
      setToast({
        message:
          error instanceof Error ? error.message : "Unable to create ticket event.",
        tone: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeading
        eyebrow="Ticketing"
        title="Reception ticketing control room"
        description="Create 2026 reception events, review recent orders, and monitor issued tickets without leaving the existing admin area."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <AdminStatCard label="Published Events" value={stats.events} tone="accent" />
        <AdminStatCard label="Orders" value={stats.orders} tone="warning" />
        <AdminStatCard label="Issued Tickets" value={stats.tickets} tone="success" />
        <AdminStatCard label="Paid Orders" value={stats.paidOrders} tone="default" />
      </div>

      <AdminToast
        message={toast.message}
        tone={toast.tone}
        onDismiss={() => setToast({ message: "", tone: "default" })}
      />

      <form onSubmit={handleCreateEvent} className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <AdminSectionHeading
          eyebrow="Create"
          title="Create a ticketed reception event"
          description="This form seeds a reception event with the three screenshot-aligned ticket cards."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            placeholder="Slug"
            value={formState.slug}
            onChange={(event) => setFormState((current) => ({ ...current, slug: event.target.value }))}
            className="h-12 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Title"
            value={formState.title}
            onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
            className="h-12 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Venue"
            value={formState.venue}
            onChange={(event) => setFormState((current) => ({ ...current, venue: event.target.value }))}
            className="h-12 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <select
            value={formState.status}
            onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))}
            className="h-12 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <input
            type="datetime-local"
            value={formState.startsAt}
            onChange={(event) => setFormState((current) => ({ ...current, startsAt: event.target.value }))}
            className="h-12 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            type="datetime-local"
            value={formState.endsAt}
            onChange={(event) => setFormState((current) => ({ ...current, endsAt: event.target.value }))}
            className="h-12 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="mt-6 space-y-4">
          {formState.ticketTypes.map((ticketType, index) => (
            <div key={ticketType.tierKey} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">
                {ticketType.name}
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <input
                  type="number"
                  value={ticketType.capacity}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      ticketTypes: current.ticketTypes.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, capacity: Number(event.target.value) } : item,
                      ),
                    }))
                  }
                  className="h-11 rounded-[10px] border border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  type="number"
                  value={ticketType.pricePaise || ticketType.minDonationPaise || 0}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      ticketTypes: current.ticketTypes.map((item, itemIndex) => {
                        if (itemIndex !== index) return item;
                        return item.ticketMode === "donation"
                          ? { ...item, minDonationPaise: Number(event.target.value) }
                          : { ...item, pricePaise: Number(event.target.value) };
                      }),
                    }))
                  }
                  className="h-11 rounded-[10px] border border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  type="datetime-local"
                  value={ticketType.saleStartsAt}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      ticketTypes: current.ticketTypes.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, saleStartsAt: event.target.value } : item,
                      ),
                    }))
                  }
                  className="h-11 rounded-[10px] border border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  type="datetime-local"
                  value={ticketType.saleEndsAt}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      ticketTypes: current.ticketTypes.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, saleEndsAt: event.target.value } : item,
                      ),
                    }))
                  }
                  className="h-11 rounded-[10px] border border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex rounded-full bg-amber-500 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create ticket event"}
          </button>
        </div>
      </form>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <AdminSectionHeading eyebrow="Orders" title="Recent ticket orders" />
          {loading ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading orders…</p>
          ) : orders.length === 0 ? (
            <AdminAlert title="No orders yet" description="Ticket orders will appear here after the first booking." tone="info" className="mt-4" />
          ) : (
            <div className="mt-4 space-y-3">
              {orders.slice(0, 8).map((order) => (
                <div key={order.id} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{order.public_order_code}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {order.buyer_name} · {order.buyer_email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        ₹{Math.round((order.total_paise || 0) / 100)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-amber-600">{order.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <AdminSectionHeading eyebrow="Tickets" title="Issued reception tickets" />
          {loading ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading tickets…</p>
          ) : tickets.length === 0 ? (
            <AdminAlert title="No tickets issued yet" description="Issued tickets will appear here after a free or paid booking is finalized." tone="info" className="mt-4" />
          ) : (
            <div className="mt-4 space-y-3">
              {tickets.slice(0, 8).map((ticket) => (
                <div key={ticket.id} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{ticket.ticket_code}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {ticket.attendee_name} · {ticket.ticket_types?.name || "Ticket"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
