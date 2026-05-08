import { ClerkProvider } from '@clerk/nextjs';

const clerkJsUrl =
  process.env.NEXT_PUBLIC_CLERK_JS_URL ||
  'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6/dist/clerk.browser.js';

export default function TasiClerkProvider({ children }) {
  return (
    <ClerkProvider __internal_clerkJSUrl={clerkJsUrl} prefetchUI={false}>
      {children}
    </ClerkProvider>
  );
}
