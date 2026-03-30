import { auth, currentUser } from '@clerk/nextjs/server';
import { getClerkConfigDiagnostics } from '@/lib/clerk-config';
import operatorAuthUi from '@/lib/operator-auth-ui.cjs';
import operatorSession from '@/lib/operator-session.cjs';

const { getOperatorNavbarState } = operatorAuthUi;
const { toOperatorSession, logOperatorEvent } = operatorSession;

function parseEmailList(value) {
  return new Set(
    String(value || '')
      .split(/[,\n]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

function getAccessMode() {
  const mode = String(process.env.CLERK_ACCESS_MODE || 'both')
    .trim()
    .toLowerCase();

  if (
    mode === 'email_allowlist' ||
    mode === 'metadata_roles' ||
    mode === 'both'
  ) {
    return mode;
  }

  return 'both';
}

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

  try {
    const session = await auth();
    const sessionUserIdPresent = Boolean(session?.userId);

    if (!session?.userId) {
      const result = {
        authorized: false,
        reason: 'unauthenticated',
        clerkConfig,
        sessionUserIdPresent,
        currentUserResolved: false,
      };

      logOperatorEvent('operator.resolved', route, result);
      return result;
    }

    const user = await currentUser();
    const currentUserResolved = Boolean(user?.id);
    const emails = (user?.emailAddresses || []).map((entry) =>
      entry.emailAddress.toLowerCase()
    );
    const primaryEmail = emails[0] || '';
    const adminEmails = parseEmailList(process.env.CLERK_ADMIN_EMAILS);
    const reviewerEmails = parseEmailList(process.env.CLERK_REVIEWER_EMAILS);
    const accessMode = getAccessMode();
    const metadataRole =
      user?.publicMetadata?.tasiRole ||
      user?.publicMetadata?.role ||
      user?.unsafeMetadata?.tasiRole ||
      user?.unsafeMetadata?.role;

    const hasAdminEmail = emails.some((email) => adminEmails.has(email));
    const hasReviewerEmail = emails.some((email) => reviewerEmails.has(email));
    const metadataRoleMatch =
      metadataRole === 'admin' || metadataRole === 'reviewer'
        ? metadataRole
        : null;

    let role = null;
    let allowlistSource = null;

    if (accessMode === 'email_allowlist' || accessMode === 'both') {
      role = hasAdminEmail ? 'admin' : hasReviewerEmail ? 'reviewer' : role;
      if (role) {
        allowlistSource = 'email_allowlist';
      }
    }

    if (!role && (accessMode === 'metadata_roles' || accessMode === 'both')) {
      role = metadataRoleMatch;
      if (role) {
        allowlistSource = 'metadata_roles';
      }
    }

    if (!role) {
      const result = {
        authorized: false,
        reason: 'unauthorized',
        primaryEmail,
        accessMode,
        clerkConfig,
        sessionUserIdPresent,
        currentUserResolved,
        allowlistSource,
      };

      logOperatorEvent('operator.resolved', route, result);
      return result;
    }

    const result = {
      authorized: true,
      role,
      userId: user?.id,
      primaryEmail,
      displayName: user?.fullName || primaryEmail || 'TASI Operator',
      accessMode,
      clerkConfig,
      sessionUserIdPresent,
      currentUserResolved,
      allowlistSource,
      operatorSession: toOperatorSession({
        authorized: true,
        role,
        userId: user?.id,
        primaryEmail,
        displayName: user?.fullName || primaryEmail || 'TASI Operator',
        accessMode,
      }),
    };

    logOperatorEvent('operator.resolved', route, result);
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
    });
    return result;
  }
}

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
