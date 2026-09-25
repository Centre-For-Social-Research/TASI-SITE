const links = [
  { label: 'News', href: '/blog' },
  { label: 'Testimonials', href: '#video-testimonials' },
  { label: 'Speakers', href: '/speakers?year=2026' },
  { label: 'Sponsors', href: '/sponsor' },
  { label: 'Exhibit', href: '/exhibition' },
];

export default function HomeQuickLinks() {
  return (
    <nav
      aria-label="Explore TASI"
      className="px-6 pt-section-sm md:pt-section-md lg:px-16 lg:pt-section-lg"
    >
      <div className="relative -top-2 -mt-7 md:-mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {links.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="rounded-full border-[1.5px] border-white px-5 py-1.5 md:px-6 md:py-2 text-[13px] md:text-sm font-bold text-white transition-all hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
