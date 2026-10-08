import { ExternalLink, Mail } from 'lucide-react';
import {
  TRAVEL_CONTACT_EMAIL,
  travelCardStyle as style,
  visaSteps,
} from '@/data/plan-your-travel-page';
import TravelShell from './travel-shell';
import { travelIcons } from './travel-icons';

export default function VisaInformationPage() {
  return (
    <TravelShell>
      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Visas and passports
            </h2>
            <p className="mt-3 max-w-2xl text-stone-600 dark:text-stone-400">
              If you are travelling to India from abroad, sort out your visa
              well before you fly.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {visaSteps.map((step) => {
              const Icon = travelIcons[step.icon];
              const isEmail = step.cta?.href.startsWith('mailto:');

              return (
                <div
                  key={step.title}
                  className={`rounded-[10px] border p-6 ${style.border} ${style.bg}`}
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] ${style.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${style.iconText}`} />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-stone-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {step.description}
                  </p>
                  {step.cta && (
                    <a
                      href={step.cta.href}
                      {...(isEmail
                        ? {}
                        : { target: '_blank', rel: 'noopener noreferrer' })}
                      className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${style.ctaText}`}
                    >
                      {step.cta.label}
                      {isEmail ? (
                        <Mail className="h-3.5 w-3.5" />
                      ) : (
                        <ExternalLink className="h-3 w-3" />
                      )}
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-[10px] bg-[#350265] p-6 text-white md:p-8">
            <p className="font-bold">Questions about your visa?</p>
            <p className="mt-1 text-sm text-white/80">
              Write to us and we will help where we can.
            </p>
            <a
              href={`mailto:${TRAVEL_CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ffd919] px-5 py-2 text-sm font-bold text-[#350265] transition hover:brightness-105"
            >
              <Mail className="h-4 w-4" />
              {TRAVEL_CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </TravelShell>
  );
}
