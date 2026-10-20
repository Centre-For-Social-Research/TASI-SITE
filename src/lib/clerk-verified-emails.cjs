// Only verified addresses may grant a role. Clerk lists a secondary address on
// the user as soon as it is added, before the owner proves they control it, so
// matching every entry in emailAddresses would let anyone claim an allowlisted
// address that has not signed up yet.
function getVerifiedUserEmails(user) {
  const entries = Array.isArray(user?.emailAddresses)
    ? user.emailAddresses
    : [];
  const verified = entries.filter(
    (entry) => entry?.emailAddress && entry.verification?.status === 'verified'
  );
  const primary = verified.find(
    (entry) => entry.id && entry.id === user?.primaryEmailAddressId
  );

  return {
    emails: verified.map((entry) => entry.emailAddress.toLowerCase()),
    primaryEmail: primary ? primary.emailAddress.toLowerCase() : '',
  };
}

// The Clerk session token can carry the primary email so a request needs no
// Backend API call. Configure it once in Clerk → Sessions → Customize session
// token (the TASi-App shares the instance; extra claims do not affect it):
//   { "primary_email": "{{user.primary_email_address}}",
//     "full_name": "{{user.full_name}}" }
// Clerk only lets a verified address be primary, so this claim is verified.
function getSessionClaimIdentity(sessionClaims) {
  const email = String(sessionClaims?.primary_email || '')
    .trim()
    .toLowerCase();
  if (!email || !email.includes('@')) return null;
  const fullName = String(sessionClaims?.full_name || '').trim();
  return { emails: [email], primaryEmail: email, fullName };
}

module.exports = { getVerifiedUserEmails, getSessionClaimIdentity };
