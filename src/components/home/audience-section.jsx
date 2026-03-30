import Image from 'next/image';

import { MotionItem, MotionReveal, MotionStagger } from './motion-reveal';

const audience = [
  {
    tag: 'Policy',
    title: 'Government & Regulators',
    text: 'Senior officials and regulatory authorities shaping AI governance, digital policy, cybersecurity strategy and platform compliance.',
    image: '/img/home-gallery/7T7A5002.JPG',
    imageAlt: 'Government and regulatory delegates at TASI',
  },
  {
    tag: 'Industry',
    title: 'Industry Leaders',
    text: 'Delegations from global technology companies, AI developers, platforms and startups working on safety by design and transparency.',
    image: '/img/home-gallery/7T7A5636.JPG',
    imageAlt: 'Industry leaders and participants at TASI',
  },
  {
    tag: 'Research',
    title: 'Civil Society Organisations',
    text: 'Digital rights advocates, academic institutions and independent researchers specialising in AI ethics and platform governance.',
    image: '/img/home-gallery/7T7A9942.webp',
    imageAlt: 'Civil society and research participants at TASI',
  },
  {
    tag: 'Global',
    title: 'International Delegations',
    text: 'Representatives from embassies, multilaterals and development agencies strengthening cross-border cooperation on digital harms.',
    image: '/img/home-gallery/7T7A9973.webp',
    imageAlt: 'International delegations and diplomatic guests at TASI',
  },
];

export default function AudienceSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#f5f1ea_0%,#ffffff_100%)] py-section-sm text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] dark:text-stone-100 md:py-section-lg">
      <div className="mx-auto max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
            Audience
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[3.2rem]">
            Who Will You{' '}
            <span className="text-rc-primary dark:text-white">Meet?</span>
          </h2>
          <p className="mt-5 text-body-lg text-stone-700 dark:text-slate-300">
            TASI brings together the cross-sector community shaping India&apos;s
            trust, safety, and AI governance agenda.
          </p>
        </MotionReveal>

        <MotionStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {audience.map((item) => (
            <MotionItem key={item.title}>
              <article className="flex h-full flex-col overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-lg shadow-stone-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                <div className="relative aspect-[1.5/1] w-full">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 23vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="flex h-full flex-col p-5 md:p-6">
                  <div className="inline-block rounded-[10px] bg-rc-primary px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white dark:bg-white dark:text-slate-950">
                    {item.tag}
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-stone-900 dark:text-white md:text-[1.35rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                    {item.text}
                  </p>
                </div>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
