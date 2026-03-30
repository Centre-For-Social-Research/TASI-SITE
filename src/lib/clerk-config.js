export function getClerkConfigDiagnostics() {
  const publishableKeyConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
  );
  const secretKeyConfigured = Boolean(process.env.CLERK_SECRET_KEY?.trim());

  return {
    publishableKeyConfigured,
    secretKeyConfigured,
    fullyConfigured: publishableKeyConfigured && secretKeyConfigured,
  };
}

export function isClerkClientConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());
}
