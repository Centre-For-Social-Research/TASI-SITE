import TravelShell from '@/components/travel/travel-shell';
import {
  Globe,
  Clock,
  Shirt,
  Droplets,
  Zap,
  Phone,
  Banknote,
  AlertTriangle,
  Camera,
  Accessibility,
} from 'lucide-react';

export const metadata = {
  title: 'General Information – Plan Your Travel · TASI 2026',
  description:
    'Currency, time zone, emergency contacts, dress code, and essential travel tips for your visit to TASI 2026 in New Delhi.',
};

// ─── Data ────────────────────────────────────────────────────────────────────

const quickStats = [
  { label: 'Time Zone', value: 'IST · GMT +5:30' },
  { label: 'Currency', value: '₹ Indian Rupee' },
  { label: 'USD / INR', value: '1 USD ≈ ₹ 92' },
  { label: 'Electricity', value: '220–240V · C/D' },
  { label: 'Country Code', value: '+91 India' },
  { label: 'Emergency', value: '112' },
];

const infoItems = [
  {
    icon: Globe,
    color: 'sky',
    title: 'About New Delhi',
    body: 'Delhi has been a city of historical significance, one that has witnessed multiple eras and empires, from the Pandavas to the Mughals, giving it a rich cultural and architectural heritage. Monuments and historical landmarks can be found throughout the city, creating a vibrant blend of the ancient and the modern. Delhi offers a wide array of attractions, bustling markets, and diverse cuisines. Notable landmarks include Connaught Place, Rashtrapati Bhavan, Kartavya Path, India Gate, Qutab Minar, and Akshardham Temple.',
  },
  {
    icon: Clock,
    color: 'amber',
    title: 'Time Zone',
    body: 'Local time in New Delhi follows Indian Standard Time (IST), which is GMT +5:30 hours. In October, Delhi is generally warm during the day and pleasantly cool in the evening, with typical temperatures around 20C to 34C. Delegates should bring light, breathable clothes for daytime, and a light jacket or shawl for early mornings and nights.',
  },
  {
    icon: Shirt,
    color: 'purple',
    title: 'Dress Code',
    body: 'Unless otherwise specified, the dress code for all official meetings and events is formal business attire.',
  },
  {
    icon: Droplets,
    color: 'blue',
    title: 'Drinking Water',
    body: 'Delegates are advised to consume sealed bottled water only.',
  },
  {
    icon: Zap,
    color: 'yellow',
    title: 'Electricity',
    body: 'Electric supply in India is 220–240 volts, with plug types C and D. Delegates are advised to carry their own universal adapters for charging electronic devices.',
  },
  {
    icon: Phone,
    color: 'green',
    title: 'International Dial Codes',
    body: 'The country code for India is +91, and the local code for New Delhi is 11. To call a local landline number, dial +9111 followed by the number. To call an Indian mobile number from abroad, dial +91 followed by the mobile number.',
  },
  {
    icon: Banknote,
    color: 'emerald',
    title: 'Currency and Banking',
    body: 'The currency of India is the Indian Rupee (INR). The current exchange rate against the US Dollar is approximately ₹92 = 1 USD (subject to change). Currency can be exchanged at the airport, designated government-approved foreign exchange counters, and select hotels. ATMs are widely available, and major international credit cards are accepted in most hotels, restaurants, and shops.',
  },
  {
    icon: AlertTriangle,
    color: 'red',
    title: 'Emergency Contacts',
    body: 'For any urgent situation in India, call 112 (Police, Fire, Ambulance). During TASI, the venue usually has an on-site emergency response team, and delegates can also contact venue help desks or summit staff immediately for rapid assistance.',
  },
  {
    icon: Camera,
    color: 'violet',
    title: 'Photography & Media Usage',
    body: 'Delegates and participants may be filmed or photographed by official photographers. Official photographs and highlight videos will be made available on the TASI website following the conclusion of the event.',
  },
  {
    icon: Accessibility,
    color: 'teal',
    title: 'Accessibility & Special Needs',
    body: 'Delegates are encouraged to inform the organising team of any special requirements, including accessibility needs, dietary restrictions, allergies, or medical conditions in advance. All such information will be treated confidentially.',
  },
];

// Full static class names so Tailwind JIT includes them at build time
const colorStyles = {
  sky: {
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconText: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-800',
    cardBg: 'bg-sky-50 dark:bg-sky-950/20',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    cardBg: 'bg-amber-50 dark:bg-amber-950/20',
  },
  purple: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconText: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    cardBg: 'bg-purple-50 dark:bg-purple-950/20',
  },
  blue: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    cardBg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  yellow: {
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    iconText: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    cardBg: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
  green: {
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconText: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    cardBg: 'bg-green-50 dark:bg-green-950/20',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  red: {
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconText: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    cardBg: 'bg-red-50 dark:bg-red-950/20',
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
    cardBg: 'bg-violet-50 dark:bg-violet-950/20',
  },
  teal: {
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconText: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    cardBg: 'bg-teal-50 dark:bg-teal-950/20',
  },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GeneralInfoPage() {
  return (
    <TravelShell>
      {/* Quick stats bar */}
      <section className="border-b border-stone-200 bg-stone-50 px-4 py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickStats.map((s) => (
              <div
                key={s.label}
                className="rounded-[10px] border border-stone-200 bg-white p-3 text-center dark:border-stone-700 dark:bg-stone-800"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {s.label}
                </p>
                <p className="mt-1 text-sm font-bold text-stone-900 dark:text-white">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info cards */}
      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Travel Tips
            </p>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              General Information
            </h2>
            <p className="mt-3 max-w-2xl text-stone-600 dark:text-stone-400">
              Essential information for delegates travelling to New Delhi for
              TASI 2026.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {infoItems.map((item) => {
              const Icon = item.icon;
              const c = colorStyles[item.color];
              return (
                <div
                  key={item.title}
                  className={`rounded-[10px] border p-6 ${c.border} ${c.cardBg}`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] ${c.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${c.iconText}`} />
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
