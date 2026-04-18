'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useClerk } from '@clerk/nextjs';
import {
  Users,
  Send,
  ScanLine,
  Ticket,
  Mail,
  Moon,
  Sun,
  LogOut,
  Search,
  CornerDownLeft,
} from 'lucide-react';

function buildCommands({ router, setTheme, theme, signOut }) {
  const go = (href) => () => router.push(href);
  return [
    {
      id: 'nav-registrations',
      label: 'Go to Registrations',
      group: 'Navigate',
      hint: 'g r',
      icon: Users,
      run: go('/admin/registrations'),
    },
    {
      id: 'nav-check-in',
      label: 'Go to Check-In Console',
      group: 'Navigate',
      hint: 'g c',
      icon: ScanLine,
      run: go('/admin/check-in'),
    },
    {
      id: 'nav-delivery',
      label: 'Go to Delivery Jobs',
      group: 'Navigate',
      hint: 'g d',
      icon: Send,
      run: go('/admin/delivery'),
    },
    {
      id: 'nav-email-jobs',
      label: 'Go to Registration Emails',
      group: 'Navigate',
      hint: 'g e',
      icon: Mail,
      run: go('/admin/email-jobs'),
    },
    {
      id: 'nav-tickets',
      label: 'Go to Ticketing',
      group: 'Navigate',
      hint: 'g t',
      icon: Ticket,
      run: go('/admin/tickets'),
    },
    {
      id: 'theme-toggle',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      group: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      run: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      id: 'sign-out',
      label: 'Sign Out',
      group: 'Account',
      icon: LogOut,
      run: () => signOut({ redirectUrl: '/' }),
    },
  ];
}

export default function AdminCommandPalette({ open, onClose }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const commands = useMemo(
    () => buildCommands({ router, setTheme, theme, signOut }),
    [router, setTheme, theme, signOut]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    if (!open) return undefined;
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const updateQuery = (value) => {
    setQuery(value);
    setCursor(0);
  };

  const handleClose = () => {
    setQuery('');
    setCursor(0);
    onClose();
  };

  const runCommand = (cmd) => {
    if (!cmd) return;
    handleClose();
    cmd.run();
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runCommand(filtered[cursor]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 px-4 pt-24 backdrop-blur-sm dark:bg-black/60"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-[10px] border border-zinc-200 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#0d1526]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-white/[0.06]">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <kbd className="hidden text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400 sm:inline dark:text-zinc-500">
            Esc
          </kbd>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No commands match.
            </li>
          ) : (
            filtered.map((cmd, index) => {
              const Icon = cmd.icon;
              const active = index === cursor;
              return (
                <li key={cmd.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => runCommand(cmd)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                      active
                        ? 'bg-purple-50 text-purple-900 dark:bg-purple-500/10 dark:text-purple-200'
                        : 'text-zinc-700 dark:text-zinc-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="flex-1 truncate">{cmd.label}</span>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
                      {cmd.group}
                    </span>
                    {cmd.hint ? (
                      <kbd className="hidden shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 sm:inline dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                        {cmd.hint}
                      </kbd>
                    ) : active ? (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-400">
          <span>TASI Admin</span>
          <span className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Run</span>
          </span>
        </div>
      </div>
    </div>
  );
}
