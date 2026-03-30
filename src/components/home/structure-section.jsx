import { MotionItem, MotionReveal, MotionStagger } from './motion-reveal';
import CountUpNumber from '../ui/count-up-number';

const stats = [
  { value: 100, suffix: '+', label: 'Strategic Conference Speakers' },
  { value: 50, suffix: '+', label: 'Strategic Conference Sessions' },
  { value: 3, label: 'Strategic Conference Stages' },
];

const formats = [
  {
    title: '01. Keynote Addresses',
    text: 'Vision-setting speeches from global leaders shaping AI governance and digital trust across public and private institutions.',
  },
  {
    title: '02. High Level Panels',
    text: 'Multi-stakeholder exchanges on trust, safety and platform accountability focused on shared problem solving.',
  },
  {
    title: '03. Fireside Chats',
    text: 'Moderated conversations examining practical challenges, implementation risks and forward-looking solutions.',
  },
  {
    title: '04. Policy Roundtables',
    text: 'Closed-door discussions that create space for candid regulatory dialogue and cross-sector convergence.',
  },
  {
    title: '05. Industry Spotlights',
    text: 'Curated sessions surfacing emerging trust and safety tools, research insights and responsible innovation models.',
  },
  {
    title: '06. Interactive Workshops',
    text: 'Hands-on sessions using real case studies so participants leave with frameworks they can apply immediately.',
  },
];

export default function StructureSection() {
  return (
    <section className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg">
      <div className="mx-auto max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
            Structure
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3.2rem]">
            Convening{' '}
            <span className="text-rc-primary dark:text-white">Format</span>
          </h2>
          <p className="mt-5 text-body-lg text-stone-700 dark:text-slate-300">
            TASI 2026 is designed as a multi-layered convening that moves from
            headline policy dialogue into practical, implementation-focused
            exchange, carrying delegates from vision into execution.
          </p>
        </MotionReveal>

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          <MotionStagger className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
            {stats.map((stat) => (
              <MotionItem key={stat.label}>
                <div className="flex h-full flex-col justify-center rounded-[10px] bg-[linear-gradient(145deg,#350265_0%,#4a0c7f_100%)] p-6 text-left shadow-xl shadow-[#350265]/20 transition-transform duration-300 hover:-translate-y-1 md:p-8">
                  <CountUpNumber
                    end={stat.value}
                    suffix={stat.suffix || ''}
                    className="text-5xl font-black text-rc-secondary dark:text-white md:text-6xl"
                  />
                  <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-white/80">
                    {stat.label}
                  </p>
                </div>
              </MotionItem>
            ))}
          </MotionStagger>

          <MotionStagger className="grid w-full gap-6 md:grid-cols-2">
            {formats.map((item) => (
              <MotionItem key={item.title}>
                <article className="h-full rounded-[10px] border border-stone-200 bg-stone-50/70 p-7 shadow-lg shadow-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 md:p-8">
                  <h3 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                    {item.title}
                  </h3>
                  <div className="mt-5 h-1 w-14 rounded-full bg-rc-accent dark:bg-white"></div>
                  <p className="mt-5 text-body-md leading-relaxed text-stone-600 dark:text-slate-300">
                    {item.text}
                  </p>
                </article>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </div>
    </section>
  );
}
