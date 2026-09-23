const { createHash } = require('node:crypto');

const CLAIM_SCOPE = 'volunteer-application-email';

async function hasVolunteerApplication(supabase, email) {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id')
    .eq('source', 'volunteer-application')
    .eq('email', email)
    .limit(1);

  if (error)
    throw new Error('Unable to check existing volunteer applications.');
  return Boolean(data?.length);
}

async function reserveVolunteerApplication(supabase, email, now = new Date()) {
  if (await hasVolunteerApplication(supabase, email)) {
    return { state: 'existing' };
  }

  const key = createHash('sha256').update(email).digest('hex');
  const expired = await supabase
    .from('app_idempotency_keys')
    .delete()
    .eq('scope', CLAIM_SCOPE)
    .eq('idempotency_key', key)
    .lt('expires_at', now.toISOString());

  if (expired.error)
    throw new Error('Unable to check the volunteer submission.');

  const claim = await supabase.from('app_idempotency_keys').insert({
    scope: CLAIM_SCOPE,
    idempotency_key: key,
    status: 'processing',
    expires_at: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
  });

  if (!claim.error) return { state: 'claimed', key };
  if (claim.error.code !== '23505') {
    throw new Error('Unable to check the volunteer submission.');
  }

  return (await hasVolunteerApplication(supabase, email))
    ? { state: 'existing' }
    : { state: 'processing' };
}

async function releaseVolunteerApplicationClaim(supabase, key) {
  return supabase
    .from('app_idempotency_keys')
    .delete()
    .eq('scope', CLAIM_SCOPE)
    .eq('idempotency_key', key);
}

module.exports = {
  CLAIM_SCOPE,
  reserveVolunteerApplication,
  releaseVolunteerApplicationClaim,
};
