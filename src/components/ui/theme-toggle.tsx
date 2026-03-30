'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          'w-16 h-8 rounded-full border border-zinc-200 dark:border-zinc-800',
          className
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={cn(
        'flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300',
        isDark
          ? 'bg-zinc-950 border border-zinc-800'
          : 'bg-white border border-zinc-200',
        className
      )}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      aria-label="Toggle theme"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            'flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300',
            isDark
              ? 'transform translate-x-0 bg-zinc-800'
              : 'transform translate-x-8 bg-gray-200'
          )}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-white" strokeWidth={1.5} />
          ) : (
            <Sun className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
          )}
        </div>
        <div
          className={cn(
            'flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300',
            isDark ? 'bg-zinc-900/70' : 'transform -translate-x-8'
          )}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-white/90" strokeWidth={1.75} />
          ) : (
            <Moon className="w-4 h-4 text-black" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  );
}
