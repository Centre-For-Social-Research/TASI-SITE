import { ClerkProvider } from '@clerk/nextjs';

export default function ClerkLayout({ children }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
