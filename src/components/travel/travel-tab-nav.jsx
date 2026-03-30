'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const tabs = [
  { label: 'Overview', href: '/plan-your-travel' },
  { label: 'General Info', href: '/plan-your-travel/general-info' },
  { label: 'How to Reach', href: '/plan-your-travel/how-to-reach' },
  { label: 'Visa Information', href: '/plan-your-travel/visa-information' },
  { label: 'Accommodation', href: '/plan-your-travel/accommodation' },
];

export default function TravelTabNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-[60px] z-30 border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
      <div className="overflow-x-auto px-4 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-max min-w-full justify-center gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-shrink-0 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-semibold transition ${
                  isActive
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-stone-500 hover:border-amber-300 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
