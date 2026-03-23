import Image from "next/image";

const quotes = [
  {
    text: "The Trust and Safety India Festival is important because it brings diverse stakeholders onto a common ground. The real task is to engage in sustained, meaningful dialogue.",
    author: "S. Krishnan, Secretary, MeitY, Government of India",
    photo: "/img/speakers/S Krishnan.png",
  },
  {
    text: "To address Technology Facilitated Gender Based Violence, there is a need for a multipronged approach by improving digital literacy and security, content moderation, and law enforcement capacities.",
    author: "Kanta Singh, Country Representative, UN Women India",
    photo: "/img/speakers/Kanta Singh.jpg",
  },
  {
    text: "As one of the largest and fastest-growing digital populations, India is a natural centre for this gathering of key stakeholders and leading trust and safety experts.",
    author: "Sophie Mortimer, Manager, UK Revenge Porn Helpline, SWGfL",
    photo: "/img/speakers/Sophie Mortimer.jpg",
  },
];

export default function AboutQuotes() {
  return (
    <section className="bg-white py-section-sm md:py-section-lg">
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <div className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">Voices from TASI</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl lg:text-[3.2rem]">What Leaders Said</h2>
          <p className="mt-5 text-body-lg text-stone-700">
            Perspectives from senior leaders, practitioners, and global experts who helped shape the first edition.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quotes.map((quote) => (
            <blockquote
              key={quote.author}
              className="flex h-full flex-col justify-between rounded-[10px] border border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] p-7 text-stone-700 shadow-lg shadow-stone-200/40 md:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-stone-200 bg-white">
                  <Image src={quote.photo} alt={quote.author} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{quote.author.split(",")[0]}</p>
                  <p className="text-xs leading-relaxed text-stone-500">{quote.author.split(",").slice(1).join(",").trim()}</p>
                </div>
              </div>
              <p className="text-body-lg leading-relaxed text-stone-800">{quote.text}</p>
              <cite className="mt-8 text-sm not-italic font-medium text-stone-500">{quote.author}</cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
