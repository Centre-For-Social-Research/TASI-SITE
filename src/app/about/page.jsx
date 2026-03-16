import Link from "next/link";
import TeamGrid from "@/components/about/team-grid";
import AboutQuotes from "@/components/about/quotes";
import DarkHeroParticles from "@/components/ui/dark-hero-particles";
import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";

const stats = [
  ["500+", "Participants Attended (2025)"],
  ["100+", "Expert Speakers"],
  ["15", "Countries Represented"],
  ["32", "Partner Organisations"],
  ["30+", "Sessions (Panels, Workshops)"],
  ["10+", "Dedicated Workshops"],
];

export default function AboutPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white py-14 dark:bg-[radial-gradient(circle_at_20%_0%,#1f2937_0%,#0b1220_45%,#05070e_100%)] md:py-20">
          <DarkHeroParticles />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-slate-300">About TASI 2026</p>
            <h1 className="text-4xl font-black tracking-tight text-stone-900 dark:text-slate-100 md:text-6xl">
              India&apos;s Foremost
              <span className="block text-orange-700">Trust and Safety Convening</span>
            </h1>
          </div>
        </section>

        <section className="bg-white py-14 md:py-16">
          <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 md:grid-cols-2 md:px-6">
            <div>
              <p className="mb-4 text-lg text-stone-700">
                The Trust and Safety India Festival (TASI) is India&apos;s first national convening focused on trust and safety, led by civil society.
              </p>
              <p className="mb-4 text-stone-700">
                Convened by the Centre for Social Research (CSR) and Trust and Safety Forum, TASI creates a collaborative space for dialogue across government, industry, academia, and civil society.
              </p>
              <p className="text-stone-700">
                The festival advances innovation while centering safety and wellbeing, especially for women, children, and marginalised communities.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map(([value, label]) => (
                <article key={label} className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-2xl font-black text-stone-900">{value}</p>
                  <p className="text-sm text-stone-600">{label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-stone-100 py-14 md:py-16">
          <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 md:px-6">
            <article className="rounded-2xl border border-stone-200 bg-white p-8">
              <h2 className="mb-4 text-2xl font-black tracking-tight text-orange-700">Trust and Safety Festival</h2>
              <p className="mb-4 text-stone-700">
                The Trust &amp; Safety Forum is a global platform dedicated to advancing digital safety through collaboration among technology companies, policymakers, civil society organizations, and researchers. Co-founded by Caroline Humer and Jean-Christophe Le Toquin, the festival brings together diverse stakeholders to address critical challenges in creating safer online environments.
              </p>
              <p className="text-stone-700">
                TASI 2025 was co-organized by the Centre for Social Research (CSR) and the Trust &amp; Safety Festival, marking the festival&apos;s first edition in India. This collaboration brought together CSR&apos;s four decades of leadership in gender equality and digital safety with the Trust &amp; Safety Festival&apos;s global network, creating a landmark event in New Delhi that centered Indian perspectives and priorities in shaping the future of online safety for the Global South.
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-8">
              <h2 className="mb-4 text-2xl font-black tracking-tight text-orange-700">Centre for Social Research (CSR)</h2>
              <p className="mb-4 text-stone-700">
                The Centre for Social Research (CSR) is a pioneering organization dedicated to advancing gender equality and women&apos;s empowerment. CSR has been at the forefront of the women&apos;s movement in India for over four decades, working to address various social, cultural, and economic challenges faced by women. The organization engages in research, advocacy, capacity-building, and community outreach initiatives to promote gender justice and create a more inclusive society.
              </p>
              <p className="mb-4 text-stone-700">
                Its areas of focus include combating violence against women; promoting women&apos;s political participation and economic empowerment; gender, water and climate change; and advocating for gender-sensitive policies and legislation.
              </p>
              <p className="mb-4 text-stone-700">
                Recognizing the evolving challenges of the digital age, CSR has developed a comprehensive Digital Safety and Online Well-being program that addresses online gender-based violence, cyber harassment, digital privacy, and responsible technology use. Through digital literacy workshops, training sessions, and strategic advocacy efforts, the organization works to empower women and marginalized communities to navigate digital spaces safely. CSR partners with educational institutions, corporates, and civil society organizations to conduct awareness campaigns, develop policy recommendations, and build capacity among diverse stakeholders — from young women and adolescents to educators and law enforcement. This work has positioned CSR as a leading voice in advocating for digital rights and gender-responsive technology policies in India.
              </p>
              <p className="font-semibold text-stone-800">
                CSR, through its collective efforts, aims to create a future where all genders in India enjoy equal rights, opportunities, and the agency to drive positive change.
              </p>
            </article>
          </div>
        </section>

        <TeamGrid />
        <AboutQuotes />

        <section className="bg-white py-12">
          <div className="mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <h2 className="mb-4 text-3xl font-black tracking-tight text-stone-900 md:text-4xl">Be Part of the Conversation</h2>
            <Link href="/register" className="inline-flex rounded-md bg-orange-700 px-6 py-3 font-semibold text-white hover:bg-orange-800">
              Register for TASI 2026
            </Link>
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}