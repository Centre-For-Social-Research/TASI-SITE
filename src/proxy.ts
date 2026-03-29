import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/admin(.*)',
    '/sign-in(.*)',
    '/api/admin(.*)',
    '/api/operator(.*)',
    '/api/check-in(.*)',
  ],
};
