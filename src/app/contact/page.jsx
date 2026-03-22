import HomeNavbar from "@/components/home/navbar";
import BrandedPageHero from "@/components/ui/branded-page-hero";

const sponsorshipContacts = [
  {
    name: "Jyoti Vadehra",
    email: "jyoti@csrindia.org",
    role: "Lead, Digital Trust and Safety | Head, Media & Communications, Centre For Social Research",
  },
  {
    name: "Karuna Nain",
    email: "karunanain@googlemail.com",
    role: "Online Safety Expert / Advisor, Centre for Social Research",
  },
  {
    name: "Caroline Humer",
    email: "c.humer@trustandsafetyforum.org",
    role: "Co Founder, Trust & Safety Festival",
  },
  {
    name: "JC Le Toquin",
    email: "jc.letoquin@trustandsafetyforum.org",
    role: "Co Founder, Trust & Safety Festival",
  },
  {
    name: "Dr. Ranjana Kumari",
    email: "ranjanakumari@csrindia.org",
    role: "Director, Centre For Social Research",
  },
];

export default function ContactPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] pb-20 dark:bg-stone-950">
        <BrandedPageHero className="py-12">
          <div className="relative z-10 mx-auto max-w-6xl px-6 text-center sm:px-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">Get in Touch</p>
            <h1 className="mt-4 font-[family:var(--font-outfit)] text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
              Contact Us
            </h1>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-14 max-w-6xl px-6 sm:px-8">
          <div className="rounded-[2rem] border border-stone-200/80 bg-white/80 px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-10 sm:py-12">
            <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">General Enquiries</p>
            <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-stone-900 dark:text-white sm:text-4xl">
              To Discuss Participation Opportunities
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-stone-600 dark:text-slate-300">
              Reach the team for registration, delegate participation, partnerships, and general festival-related coordination.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-stone-700 dark:text-slate-200 sm:gap-4">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950">
                +91 011 46131929
              </span>
              <a
                href="mailto:info1@csrindia.org"
                className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/15"
              >
                info1@csrindia.org
              </a>
              <a
                href="https://www.csrindia.org"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                www.csrindia.org
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl px-6 sm:px-8">
          <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
            Sponsorship Contacts
          </p>
          <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-stone-900 dark:text-white sm:text-4xl">
            To Discuss Sponsorship Opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-stone-600 dark:text-slate-300">
            Each contact below can help route sponsorship, partnership, and strategic collaboration conversations to the right team.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {sponsorshipContacts.map((contact) => (
              <article
                key={contact.email}
                className="flex h-full flex-col rounded-[1.75rem] border border-stone-200/80 bg-white/85 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/90"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Sponsor Desk</p>
                <h3 className="mt-3 text-xl font-black tracking-tight text-stone-900 dark:text-white">{contact.name}</h3>
                <p className="mt-3 break-all text-sm font-semibold">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-amber-800 transition-colors hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-200"
                  >
                    {contact.email}
                  </a>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-slate-300">{contact.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl px-6 sm:px-8">
          <div className="rounded-[2rem] border border-stone-200/80 bg-gradient-to-br from-white via-stone-50 to-amber-50/70 px-6 py-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92))] sm:px-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Visit Our Office</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-900 dark:text-white sm:text-4xl">Centre for Social Research</h2>
            <p className="mt-5 text-lg leading-relaxed text-stone-700 dark:text-slate-200">
              2, Nelson Mandela Marg, Vasant Kunj,
              <br />
              New Delhi - 110070, India
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
