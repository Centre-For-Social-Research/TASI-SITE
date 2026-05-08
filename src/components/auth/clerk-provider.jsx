import { ClerkProvider } from '@clerk/nextjs';

export default function TasiClerkProvider({ children }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
