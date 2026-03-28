import { auth, currentUser } from "@clerk/nextjs/server";
import { getClerkConfigDiagnostics } from "@/lib/clerk-config";

function parseEmailList(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

function getAccessMode() {
  const mode = String(process.env.CLERK_ACCESS_MODE || "both").trim().toLowerCase();

  if (mode === "email_allowlist" || mode === "metadata_roles" || mode === "both") {
    return mode;
  }

  return "both";
}

export async function getAuthorizedOperator() {
  const clerkConfig = getClerkConfigDiagnostics();

  if (!clerkConfig.fullyConfigured) {
    return {
      authorized: false,
      reason: "clerk_unavailable",
      clerkConfig,
    };
  }

  const session = await auth();

  if (!session?.userId) {
    return { authorized: false, reason: "unauthenticated" };
  }

  const user = await currentUser();
  const emails = (user?.emailAddresses || []).map((entry) => entry.emailAddress.toLowerCase());
  const primaryEmail = emails[0] || "";
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
  const metadataRoleMatch = metadataRole === "admin" || metadataRole === "reviewer" ? metadataRole : null;

  let role = null;

  if (accessMode === "email_allowlist" || accessMode === "both") {
    role = hasAdminEmail ? "admin" : hasReviewerEmail ? "reviewer" : role;
  }

  if (!role && (accessMode === "metadata_roles" || accessMode === "both")) {
    role = metadataRoleMatch;
  }

  if (!role) {
    return {
      authorized: false,
      reason: "unauthorized",
      user,
      primaryEmail,
      accessMode,
    };
  }

  return {
    authorized: true,
    role,
    user,
    userId: user.id,
    primaryEmail,
    displayName: user.fullName || primaryEmail || "TASI Operator",
    accessMode,
  };
}

export async function requireAuthorizedOperator() {
  const operator = await getAuthorizedOperator();

  if (!operator.authorized) {
    const status =
      operator.reason === "unauthenticated"
        ? 401
        : operator.reason === "clerk_unavailable"
          ? 503
          : 403;
    return {
      ok: false,
      response: Response.json(
        {
          error:
            operator.reason === "unauthenticated"
              ? "Please sign in."
              : operator.reason === "clerk_unavailable"
                ? "Clerk is not configured for this environment."
                : "You do not have access to this area.",
        },
        { status }
      ),
    };
  }

  return { ok: true, operator };
}
