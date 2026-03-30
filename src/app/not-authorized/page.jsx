"use client";

import HomeNavbar from "@/components/home/navbar";
import HomeFooter from "@/components/home/footer";
import { SignOutButton } from "@clerk/nextjs";

export default function NotAuthorizedPage() {
  return (
    <>
      <HomeNavbar />
      <main className="min-h-[70vh] bg-[#fbf6ee] px-6 py-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-3xl rounded-[10px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Not Authorized</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">You signed in successfully, but this account does not have operator access.</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            TASI admin access is limited to approved operators and reviewers. If this account should be able to review registrations, contact the site administrator or email info1@csrindia.org.
          </p>
          <SignOutButton redirectUrl="/sign-in">
            <button className="mt-6 rounded-md bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
              Sign out &amp; try a different account
            </button>
          </SignOutButton>
        </div>
      </main>
      <HomeFooter />
    </>
  );
}
