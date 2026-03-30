import Image from 'next/image';

const quotes = [
  {
    text: 'The Trust and Safety India Festival is important because it brings diverse stakeholders onto a common ground. The real task is to engage in sustained, meaningful dialogue.',
    author: 'S. Krishnan, Secretary, MeitY, Government of India',
    photo: '/img/speakers/S Krishnan.png',
  },
  {
    text: 'To address Technology Facilitated Gender Based Violence, there is a need for a multipronged approach by improving digital literacy and security, content moderation, and law enforcement capacities.',
    author: 'Kanta Singh, Country Representative, UN Women India',
    photo: '/img/speakers/Kanta Singh.jpg',
  },
  {
    text: 'As one of the largest and fastest-growing digital populations, India is a natural centre for this gathering of key stakeholders and leading trust and safety experts.',
    author: 'Sophie Mortimer, Manager, UK Revenge Porn Helpline, SWGfL',
    photo: '/img/speakers/Sophie Mortimer.jpg',
  },
];

export default function AboutQuotes() {
  return (
    <section className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg">
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <div className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-orange-300 md:text-sm">
            Voices from TASI
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3.2rem]">
            What Leaders Said
          </h2>
          <p className="mt-5 text-body-lg text-stone-700 dark:text-slate-300">
            Perspectives from senior leaders, practitioners, and global experts
            who helped shape the first edition.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quotes.map((quote) => (
            <blockquote
              key={quote.author}
              className="flex h-full flex-col justify-between rounded-[10px] border border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] p-7 text-stone-700 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] dark:text-slate-300 dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-stone-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <Image
                    src={quote.photo}
                    alt={quote.author}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">
                    {quote.author.split(',')[0]}
                  </p>
                  <p className="text-xs leading-relaxed text-stone-500 dark:text-slate-400">
                    {quote.author.split(',').slice(1).join(',').trim()}
                  </p>
                </div>
              </div>
              <p className="text-body-lg leading-relaxed text-stone-800 dark:text-slate-200">
                {quote.text}
              </p>
              <cite className="mt-8 text-sm not-italic font-medium text-stone-500 dark:text-slate-400">
                {quote.author}
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
