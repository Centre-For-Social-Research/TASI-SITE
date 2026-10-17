import Link from 'next/link';

import formSettings from '@/lib/form-settings.cjs';

const { getFormClosedMessage } = formSettings;

// Shown above a public form that an admin has closed from Settings. The form
// stays visible; the API rejects submissions while it is closed.
export default function FormClosedNotice({ formKey, className = '' }) {
  return (
    <p
      role="status"
      className={`rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-base font-black text-red-800 dark:border-red-900/60 dark:bg-red-950 dark:text-red-200 ${className}`}
    >
      {getFormClosedMessage(formKey)}{' '}
      <Link
        href="/tasi-2026"
        className="underline decoration-[1.5px] underline-offset-4"
      >
        See the TASI 2026 recap
      </Link>
    </p>
  );
}
