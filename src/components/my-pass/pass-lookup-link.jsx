'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket } from 'lucide-react';

import passLookupWindow from '@/lib/pass-lookup-window.cjs';

const { isPassLookupOpen } = passLookupWindow;

const HIDDEN_PREFIXES = ['/admin', '/studio', '/my-pass', '/badge'];

const subscribe = () => () => {};
const getSnapshot = () => isPassLookupOpen(new Date());
// Server render always says closed; the client corrects it after hydration,
// so the static HTML outside the window never contains the link.
const getServerSnapshot = () => false;

// Renders nothing outside 9-15 October, so the site is unchanged the rest
// of the year. The server enforces the same window on the page and API.
export default function PassLookupLink() {
  const pathname = usePathname() || '';
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!open || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <Link
      href="/my-pass"
      className="fixed bottom-5 left-4 z-40 inline-flex items-center gap-2 rounded-full border-2 border-[#350265]/10 bg-[#ffd919] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#350265] shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:brightness-105 md:left-6"
    >
      <Ticket className="h-4 w-4" />
      Find my pass
    </Link>
  );
}
