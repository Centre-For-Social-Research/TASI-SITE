import {
  generalInfoItems,
  generalQuickStats,
  travelCardStyle as style,
} from '@/data/plan-your-travel-page';
import TravelShell from './travel-shell';
import { travelIcons } from './travel-icons';

export default function GeneralInfoPage() {
  return (
    <TravelShell>
      <section className="border-b border-[#350265]/10 bg-white px-4 py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {generalQuickStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[10px] border border-[#350265]/10 p-3 text-center dark:border-stone-700"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {stat.label}
              </p>
              <p className="mt-1 text-sm font-bold text-stone-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
            Before you travel
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {generalInfoItems.map((item) => {
              const Icon = travelIcons[item.icon];

              return (
                <div
                  key={item.title}
                  className={`rounded-[10px] border p-6 ${style.border} ${style.bg}`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] ${style.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${style.iconText}`} />
                    </span>
                    <h3 className="font-bold text-stone-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </TravelShell>
  );
}
