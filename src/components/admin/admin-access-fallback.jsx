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
    <main className="min-h-screen bg-[#0b0c0f] px-6 py-24 text-[#edf0f6]">
      <div className="mx-auto max-w-3xl rounded-[10px] border border-[#23262d] bg-[#111318] p-8">
        <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#8d93a5]">
          Access Required
        </p>
        <h1 className="mt-3 font-admin-display text-4xl text-[#f5f6f8]">
          {heading}
        </h1>
        <p className="mt-4 text-sm font-semibold leading-relaxed text-[#d5dae7]">
          {copy.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#9ca3b5]">
          {copy.description}
        </p>
        <dl className="mt-6 grid gap-3 rounded-[10px] border border-[#23262d] bg-[#0b0c0f] p-4 text-xs text-[#aab1c0] sm:grid-cols-3">
          <div>
            <dt className="font-admin-mono uppercase tracking-[0.14em] text-[#71788a]">
              Reason
            </dt>
            <dd className="mt-1 font-admin-mono text-[#edf0f6]">
              {operator?.reason || 'unknown'}
            </dd>
          </div>
          <div>
            <dt className="font-admin-mono uppercase tracking-[0.14em] text-[#71788a]">
              Public Key
            </dt>
            <dd className="mt-1 font-admin-mono text-[#edf0f6]">
              {getConfiguredLabel(clerkConfig.publishableKeyConfigured)}
            </dd>
          </div>
          <div>
            <dt className="font-admin-mono uppercase tracking-[0.14em] text-[#71788a]">
              Secret Key
            </dt>
            <dd className="mt-1 font-admin-mono text-[#edf0f6]">
              {getConfiguredLabel(clerkConfig.secretKeyConfigured)}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
