export default function SignInLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf6ee] px-6 dark:bg-slate-950">
      <div className="w-full max-w-[400px] animate-pulse rounded-[12px] border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {/* Logo / header */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="h-8 w-28 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-40 rounded bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Email field */}
        <div className="mb-4">
          <div className="mb-1.5 h-3.5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Password field */}
        <div className="mb-6">
          <div className="mb-1.5 h-3.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Submit button */}
        <div className="h-10 w-full rounded-lg bg-amber-200 dark:bg-amber-900/50" />

        {/* Divider */}
        <div className="my-5 h-px w-full bg-slate-100 dark:bg-slate-800" />

        {/* Footer link */}
        <div className="mx-auto h-3.5 w-48 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}
