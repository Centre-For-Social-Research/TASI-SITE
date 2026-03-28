import { ClerkProvider, SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <ClerkProvider>
      <div className="flex min-h-screen items-center justify-center">
        <SignIn />
      </div>
    </ClerkProvider>
  );
}
