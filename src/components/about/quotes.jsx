const quotes = [
  {
    text: "The Trust and Safety India Festival is important because it brings diverse stakeholders onto a common ground. The real task is to engage in sustained, meaningful dialogue.",
    author: "S. Krishnan, Secretary, MeitY, Government of India",
  },
  {
    text: "To address Technology Facilitated Gender Based Violence, there is a need for a multipronged approach by improving digital literacy and security, content moderation, and law enforcement capacities.",
    author: "Kanta Singh, Country Representative, UN Women India",
  },
  {
    text: "As one of the largest and fastest-growing digital populations, India is a natural centre for this gathering of key stakeholders and leading trust and safety experts.",
    author: "Sophie Mortimer, Manager, UK Revenge Porn Helpline, SWGfL",
  },
];

export default function AboutQuotes() {
  return (
    <section className="bg-stone-100 py-14 md:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 md:px-6">
        <div className="mb-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Voices from TASI</p>
          <h2 className="text-3xl font-black tracking-tight text-stone-900 md:text-5xl">What Leaders Said</h2>
        </div>
        {quotes.map((quote) => (
          <blockquote key={quote.author} className="rounded-2xl border border-stone-200 bg-white p-5 text-stone-700">
            <p className="mb-3 text-base md:text-lg">{quote.text}</p>
            <cite className="text-sm not-italic text-stone-500">{quote.author}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
