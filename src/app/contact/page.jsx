import HomeNavbar from "@/components/home/navbar";
import DarkHeroParticles from "@/components/ui/dark-hero-particles";

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
      <main className="bg-white pb-20 pt-28 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:pt-32">
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white py-12 dark:bg-[radial-gradient(circle_at_20%_0%,#1f2937_0%,#0b1220_45%,#05070e_100%)]">
          <DarkHeroParticles />
          <div className="relative z-10 mx-auto max-w-6xl px-6 text-center sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Get in Touch</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Contact Us</h1>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-5xl px-6 sm:px-8">
          <div className="rounded-md border border-slate-200 border-t-4 border-t-amber-500 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900 sm:px-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100">
              To Discuss Participation Opportunities
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-700 dark:text-slate-200 sm:gap-5">
              <span>+91 98105 11540</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <a href="mailto:info1@csrindia.org" className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200">
                info1@csrindia.org
              </a>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <a
                href="https://www.csrindia.org"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
              >
                www.csrindia.org
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            To Discuss Sponsorship Opportunities
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {sponsorshipContacts.map((contact) => (
              <article key={contact.email} className="rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-900 dark:text-slate-100">{contact.name}</h3>
                <p className="mt-2 break-all text-xs">
                  <a href={`mailto:${contact.email}`} className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200">
                    {contact.email}
                  </a>
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{contact.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl px-6 text-center sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">To Visit Our Office</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
            2, Nelson Mandela Marg, Vasant Kunj,
            <br />
            New Delhi - 110070, India
          </p>
        </section>
      </main>
    </>
  );
}
