'use client';

import { useClerk } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import adminExitUtils from '@/lib/admin-exit-utils.cjs';

const { shouldAutoSignOutAdminNavigation } = adminExitUtils;

function AdminRouteExitWatcherInner() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const isSigningOutRef = useRef(false);
  const { signOut } = useClerk();

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;

    if (
      previousPathname &&
      pathname &&
      !isSigningOutRef.current &&
      shouldAutoSignOutAdminNavigation(previousPathname, pathname)
    ) {
      isSigningOutRef.current = true;
      void signOut({ redirectUrl: pathname }).catch(() => {
        window.location.assign(pathname);
      });
    }

    previousPathnameRef.current = pathname;
  }, [pathname, signOut]);

  return null;
}

export default function AdminRouteExitWatcher() {
  return <AdminRouteExitWatcherInner />;
}
