import Link from "next/link";

function TicketLookupForm() {
  return (
    <form action="/api/tickets" method="GET" className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
      <input
        type="email"
        name="email"
        placeholder="Booking email"
        className="h-12 rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <input
        type="text"
        name="phone"
        placeholder="Booking phone"
        className="h-12 rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-rc-primary px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-rc-secondary"
      >
        Find tickets
      </button>
    </form>
  );
}

export default async function TicketSuccessPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const order = resolvedSearchParams?.order || "";
  const isFreeOrder = resolvedSearchParams?.free === "1";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] px-4 py-16 text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] dark:text-stone-100">
      <div className="mx-auto max-w-3xl rounded-[10px] border border-stone-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-rc-secondary">
          TASI 2026 Reception Tickets
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-900 dark:text-white">
          {isFreeOrder ? "Your tickets are reserved." : "Your payment is confirmed."}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-slate-300">
          Your confirmation email has been sent with the QR tickets for your
          reception booking. Keep the email handy for venue access.
        </p>

        {order ? (
          <div className="mt-6 rounded-[10px] border border-stone-200 bg-stone-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
              Order Reference
            </p>
            <p className="mt-2 text-xl font-black text-stone-900 dark:text-white">{order}</p>
          </div>
        ) : null}

        <div className="mt-8 rounded-[10px] border border-stone-200 bg-stone-50 p-5 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-stone-900 dark:text-white">
            Need to retrieve your tickets again?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
            Search using the booking email and phone number used during checkout.
          </p>
          <TicketLookupForm />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/receptions"
            className="inline-flex items-center justify-center rounded-full bg-rc-primary px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-rc-secondary"
          >
            Back to receptions
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-stone-700 dark:border-slate-600 dark:text-slate-200"
          >
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
}
