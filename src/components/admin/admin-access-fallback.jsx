function getConfiguredLabel(value) {
  return value ? 'configured' : 'missing';
}

function getFallbackCopy(operator) {
  const clerkConfig = operator?.clerkConfig || {};
  const reason = operator?.reason || 'unknown';
  const publishableKeyConfigured = Boolean(
    clerkConfig.publishableKeyConfigured
  );
  const secretKeyConfigured = Boolean(clerkConfig.secretKeyConfigured);

  if (reason === 'clerk_unavailable') {
    if (!publishableKeyConfigured && !secretKeyConfigured) {
      return {
        title: 'Clerk environment variables are missing.',
        description:
          'Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY for this deployment, then redeploy the site.',
      };
    }

    if (!publishableKeyConfigured) {
      return {
        title: 'The Clerk publishable key is missing.',
        description:
          'Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY for this deployment, then redeploy the site.',
      };
    }

    if (!secretKeyConfigured) {
      return {
        title: 'The Clerk secret key is missing.',
        description:
          'Set CLERK_SECRET_KEY for this deployment, then redeploy the site. The browser key is present, but server-side admin authorization cannot run without the secret key.',
      };
    }

    return {
      title: 'Clerk configuration is incomplete.',
      description:
        'Review the Clerk environment variables for this deployment, then redeploy the site.',
    };
  }

  if (reason === 'auth_error') {
    return {
      title: 'Clerk session validation failed.',
      description:
        'Clerk keys are present, but the server could not validate the admin session. Confirm the publishable and secret keys are from the same Clerk instance, the production domain is allowed in Clerk, and the latest middleware deployment is live.',
    };
  }

  return {
    title: 'Admin access is temporarily unavailable.',
    description:
      'Operator sign-in could not be completed for this deployment. Check the Clerk configuration and redeploy.',
  };
}

export default function AdminAccessFallback({
  operator,
  heading = 'Admin access is temporarily unavailable.',
}) {
  const copy = getFallbackCopy(operator);
  const clerkConfig = operator?.clerkConfig || {};

  return (
    <main className="min-h-screen bg-[#f3f3f2] px-6 py-24 font-admin-sans text-[#141414]">
      <div className="mx-auto max-w-3xl rounded-[10px] border border-black/[0.07] bg-white p-8 shadow-[0_4px_20px_rgba(17,17,17,0.05)]">
        <p className="text-xs font-medium text-[#8c8c8c]">Access Required</p>
        <h1 className="mt-3 font-admin-display text-4xl font-semibold tracking-tight text-[#141414]">
          {heading}
        </h1>
        <p className="mt-4 text-sm font-semibold leading-relaxed text-[#3b3b3b]">
          {copy.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#8c8c8c]">
          {copy.description}
        </p>
        <dl className="mt-6 grid gap-3 rounded-[10px] border border-black/[0.07] bg-[#f7f7f6] p-4 text-xs text-[#3b3b3b] sm:grid-cols-3">
          <div>
            <dt className="text-[#8c8c8c]">Reason</dt>
            <dd className="mt-1 font-medium tabular-nums text-[#141414]">
              {operator?.reason || 'unknown'}
            </dd>
          </div>
          <div>
            <dt className="text-[#8c8c8c]">Public Key</dt>
            <dd className="mt-1 font-medium tabular-nums text-[#141414]">
              {getConfiguredLabel(clerkConfig.publishableKeyConfigured)}
            </dd>
          </div>
          <div>
            <dt className="text-[#8c8c8c]">Secret Key</dt>
            <dd className="mt-1 font-medium tabular-nums text-[#141414]">
              {getConfiguredLabel(clerkConfig.secretKeyConfigured)}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
