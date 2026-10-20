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

module.exports = { getVerifiedUserEmails };
