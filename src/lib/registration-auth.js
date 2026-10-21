import { cache } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getClerkConfigDiagnostics } from '@/lib/clerk-config';
import operatorAuthUi from '@/lib/operator-auth-ui.cjs';
import operatorSession from '@/lib/operator-session.cjs';
import clerkVerifiedEmails from '@/lib/clerk-verified-emails.cjs';
import { getStoredAdminEmails } from '@/lib/admin-email-store';

const { getOperatorNavbarState } = operatorAuthUi;
const { getVerifiedUserEmails, getSessionClaimIdentity } = clerkVerifiedEmails;
const { toOperatorSession, logOperatorEvent } = operatorSession;

function parseEmailList(value) {
  return new Set(
    String(value || '')
      .split(/[,\n]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

// Access comes only from the email lists (CLERK_*_EMAILS plus the ones admins
// manage in Settings). Clerk publicMetadata roles are ignored on purpose: the
// TASi-App shares this Clerk instance and uses publicMetadata.role for its own
// admins, which must not open this console.
const ACCESS_MODE = 'email_allowlist';

function isDynamicServerUsageError(error) {
  return (
    error?.digest === 'DYNAMIC_SERVER_USAGE' ||
    String(error?.message || '').includes('Dynamic server usage')
  );
}

export async function getAuthorizedOperator(context = {}) {
  const clerkConfig = getClerkConfigDiagnostics();
  const route = context.route || 'registration-auth';

  if (!clerkConfig.fullyConfigured) {
    const result = {
      authorized: false,
      reason: 'clerk_unavailable',
      clerkConfig,
    };

    logOperatorEvent('operator.resolved', route, result);
    return result;
  }

  const startedAt = Date.now();
  try {
    const result = await resolveOperator();
    logOperatorEvent('operator.resolved', route, result, {
      durationMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    console.error('Failed to resolve Clerk operator access.', error);

    const result = {
      authorized: false,
      reason: 'auth_error',
      clerkConfig,
    };

    logOperatorEvent('operator.resolved', route, result, {
      errorMessage: error instanceof Error ? error.message : 'unknown',
      durationMs: Date.now() - startedAt,
    });
    return result;
  }
}

// Reads the operator's identity without a Clerk Backend API call when the
// session token carries primary_email (see clerk-verified-emails.cjs). Falls
// back to currentUser() for tokens that do not have the claim yet.
async function resolveIdentity(session) {
  const fromClaims = getSessionClaimIdentity(session.sessionClaims);
  if (fromClaims) {
    return { ...fromClaims, userId: session.userId, source: 'session_claims' };
  }

  const user = await currentUser();
  const { emails, primaryEmail } = getVerifiedUserEmails(user);
  return {
    emails,
    primaryEmail: primaryEmail || emails[0] || '',
    fullName: user?.fullName || '',
    userId: user?.id || session.userId,
    source: user?.id ? 'current_user' : null,
  };
}

// One lookup per request even when the layout, page and helpers all ask.
const resolveOperator = cache(async () => {
  const clerkConfig = getClerkConfigDiagnostics();
  const session = await auth();
  const sessionUserIdPresent = Boolean(session?.userId);

  if (!session?.userId) {
    return {
      authorized: false,
      reason: 'unauthenticated',
      clerkConfig,
      sessionUserIdPresent,
      currentUserResolved: false,
    };
  }

  const [identity, stored] = await Promise.all([
    resolveIdentity(session),
    getStoredAdminEmails(),
  ]);
  const { emails, primaryEmail, userId } = identity;
  const currentUserResolved = Boolean(identity.source);
  const adminEmails = new Set([
    ...parseEmailList(process.env.CLERK_ADMIN_EMAILS),
    ...stored.adminEmails.map((e) => e.toLowerCase()),
  ]);
  const reviewerEmails = new Set([
    ...parseEmailList(process.env.CLERK_REVIEWER_EMAILS),
    ...stored.reviewerEmails.map((e) => e.toLowerCase()),
  ]);
  const accessMode = ACCESS_MODE;
  const hasAdminEmail = emails.some((email) => adminEmails.has(email));
  const hasReviewerEmail = emails.some((email) => reviewerEmails.has(email));
  const role = hasAdminEmail ? 'admin' : hasReviewerEmail ? 'reviewer' : null;
  const allowlistSource = role ? 'email_allowlist' : null;

  if (!role) {
    return {
      authorized: false,
      reason: 'unauthorized',
      primaryEmail,
      accessMode,
      clerkConfig,
      sessionUserIdPresent,
      currentUserResolved,
      allowlistSource,
      identitySource: identity.source,
    };
  }

  const displayName = identity.fullName || primaryEmail || 'TASI Operator';
  return {
    authorized: true,
    role,
    userId,
    primaryEmail,
    displayName,
    accessMode,
    clerkConfig,
    sessionUserIdPresent,
    currentUserResolved,
    allowlistSource,
    identitySource: identity.source,
    operatorSession: toOperatorSession({
      authorized: true,
      role,
      userId,
      primaryEmail,
      displayName,
      accessMode,
    }),
  };
});

export async function requireAuthorizedOperator(context = {}) {
  const operator = await getAuthorizedOperator(context);

  if (!operator.authorized) {
    const status =
      operator.reason === 'unauthenticated'
        ? 401
        : operator.reason === 'clerk_unavailable'
          ? 503
          : operator.reason === 'auth_error'
            ? 503
            : 403;
    return {
      ok: false,
      response: Response.json(
        {
          error:
            operator.reason === 'unauthenticated'
              ? 'Please sign in.'
              : operator.reason === 'clerk_unavailable'
                ? 'Clerk is not configured for this environment.'
                : operator.reason === 'auth_error'
                  ? 'Clerk could not validate this session right now.'
                  : 'You do not have access to this area.',
        },
        { status }
      ),
    };
  }

  return { ok: true, operator };
}

export async function requireAdminOperator(context = {}) {
  const result = await requireAuthorizedOperator(context);
  if (!result.ok) {
    return result;
  }

  if (result.operator.role !== 'admin') {
    logOperatorEvent(
      'operator.admin_required',
      context.route || 'registration-auth',
      result.operator
    );
    return {
      ok: false,
      response: Response.json(
        {
          error:
            'This action requires an admin role. Reviewer access is read-only.',
        },
        { status: 403 }
      ),
    };
  }

  return result;
}

export async function getOperatorUiState() {
  const clerkConfig = getClerkConfigDiagnostics();

  if (!clerkConfig.fullyConfigured) {
    return {
      signedIn: false,
      authorized: false,
      dashboardHref: '/admin/registrations',
      ...getOperatorNavbarState({ signedIn: false, authorized: false }),
    };
  }

  try {
    const session = await auth();

    if (!session?.userId) {
      return {
        signedIn: false,
        authorized: false,
        dashboardHref: '/admin/registrations',
        ...getOperatorNavbarState({ signedIn: false, authorized: false }),
      };
    }

    const operator = await getAuthorizedOperator({
      route: 'operator-ui-state',
    });

    if (!operator.authorized) {
      return {
        signedIn: true,
        authorized: false,
        dashboardHref: '/admin/registrations',
        ...getOperatorNavbarState({ signedIn: true, authorized: false }),
      };
    }

    return {
      signedIn: true,
      authorized: true,
      role: operator.role,
      dashboardHref: '/admin/registrations',
      ...getOperatorNavbarState({ signedIn: true, authorized: true }),
    };
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    console.error('Failed to resolve operator UI state.', error);

    return {
      signedIn: false,
      authorized: false,
      dashboardHref: '/admin/registrations',
      ...getOperatorNavbarState({ signedIn: false, authorized: false }),
    };
  }
}
