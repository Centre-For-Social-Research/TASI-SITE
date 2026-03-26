'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';
import { isSanityConfigured } from '@/sanity/env';

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1ea] px-6 py-16 text-[#1f0d2f]">
        <div className="w-full max-w-2xl rounded-[28px] border border-[#d7c8b9] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8f4c2b]">
            Sanity Setup
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Add your Sanity project details to open the CMS
          </h1>
          <p className="mt-4 text-base leading-7 text-[#4f3a61]">
            Update <code>.env.local</code> with{' '}
            <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{' '}
            <code>NEXT_PUBLIC_SANITY_DATASET</code>, then restart the dev server
            and revisit <code>/studio</code>.
          </p>
        </div>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
