import TasiClerkProvider from '@/components/auth/clerk-provider';

export default function SignInLayout({ children }) {
  return <TasiClerkProvider>{children}</TasiClerkProvider>;
}
