import { ClerkProvider, SignIn } from "@clerk/nextjs";
import { isClerkClientConfigured } from "@/lib/clerk-config";

export default function Page() {
  if (!isClerkClientConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf6ee] px-6 py-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="w-full max-w-xl rounded-[10px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Auth Unavailable</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Sign in is not configured on this environment.</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            This deployment is missing the Clerk publishable key. Add the Clerk environment variables to this environment and redeploy to enable sign-in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider>
      <div className="flex min-h-screen items-center justify-center">
        <SignIn />
      </div>
    </ClerkProvider>
  );
}
