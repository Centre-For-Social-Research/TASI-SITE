import { ClerkProvider } from '@clerk/nextjs';

const CLERK_PROXY_PATH = '/__clerk';
const CLERK_JS_VERSION = process.env.NEXT_PUBLIC_CLERK_JS_VERSION || '6';
const CLERK_UI_VERSION = process.env.NEXT_PUBLIC_CLERK_UI_VERSION || '1';

const localClerkRuntimeProps =
  process.env.NODE_ENV === 'development'
    ? {
        proxyUrl: CLERK_PROXY_PATH,
        __internal_clerkJSUrl: `${CLERK_PROXY_PATH}/npm/@clerk/clerk-js@${CLERK_JS_VERSION}/dist/clerk.browser.js`,
        __internal_clerkUIUrl: `${CLERK_PROXY_PATH}/npm/@clerk/ui@${CLERK_UI_VERSION}/dist/ui.browser.js`,
      }
    : {};

export default function TasiClerkProvider({ children }) {
  return <ClerkProvider {...localClerkRuntimeProps}>{children}</ClerkProvider>;
}
