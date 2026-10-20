import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import certificateUtils from '@/lib/certificate-utils.cjs';
import certificateSession from '@/lib/certificate-session.cjs';

const {
  nameFromRegistration,
  newCertificateCode,
  newClaimToken,
  normalizeCertificateEdition,
  validateCertificateName,
} = certificateUtils;
const {
  CODE_TTL_MS,
  MAX_CODE_ATTEMPTS,
  hashEmailCode,
  linkExpiryFrom,
  newEmailCode,
} = certificateSession;

// Never select claim_token_hash into anything returned to a client.
const CERT_SELECT = `
  id, edition, registration_id, code, recipient_name, original_name,
  name_change_count, email, source, status, revoked_reason, revoked_at,
  revoked_by_email, issued_at, download_count, first_downloaded_at,
  last_downloaded_at, email_status, send_count, last_sent_at,
  last_provider_message_id, last_error, created_by_email, created_at, updated_at,
  token_expires_at, name_confirmed_at, pdf_sha256, reminder_count,
  last_reminded_at
`;

const db = () => getSupabaseAdmin();

export function hashClaimToken(token) {
  return createHash('sha256').update(String(token)).digest('hex');
}

function isDuplicate(error) {
  return error?.code === '23505' || /duplicate key/i.test(error?.message || '');
}

export function normalizeCertificateRow(row = {}) {
  return {
    id: row.id,
    edition: row.edition,
    registrationId: row.registration_id || null,
    code: row.code,
    name: row.recipient_name,
    originalName: row.original_name,
    nameChangeCount: Number(row.name_change_count || 0),
    email: row.email,
    source: row.source,
    status: row.status,
    revokedReason: row.revoked_reason || null,
    revokedAt: row.revoked_at || null,
    issuedAt: row.issued_at,
    downloadCount: Number(row.download_count || 0),
    firstDownloadedAt: row.first_downloaded_at || null,
    lastDownloadedAt: row.last_downloaded_at || null,
    emailStatus: row.email_status,
    sendCount: Number(row.send_count || 0),
    lastSentAt: row.last_sent_at || null,
    lastProviderMessageId: row.last_provider_message_id || null,
    lastError: row.last_error || null,
    updatedAt: row.updated_at,
    tokenExpiresAt: row.token_expires_at || null,
    nameConfirmedAt: row.name_confirmed_at || null,
    pdfSha256: row.pdf_sha256 || null,
    reminderCount: Number(row.reminder_count || 0),
    lastRemindedAt: row.last_reminded_at || null,
  };
}

export async function logCertificateEvent(
  certificateId,
  eventType,
  detail = {},
  actorEmail = null
) {
  const { error } = await db().from('attendee_certificate_events').insert({
    certificate_id: certificateId,
    event_type: eventType,
    detail,
    actor_email: actorEmail,
  });
  if (error) console.error('Certificate event not logged.', error.message);
}

export async function listCertificates({ edition } = {}) {
  const { data, error } = await db()
    .from('attendee_certificates')
    .select(CERT_SELECT)
    .eq('edition', normalizeCertificateEdition(edition))
    .order('recipient_name', { ascending: true })
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeCertificateRow);
}

export async function countEligibleWithoutCertificate({ edition } = {}) {
  const pending = await listEligibleWithoutCertificate({ edition });
  return pending.length;
}

async function listEligibleWithoutCertificate({ edition } = {}) {
  const selected = normalizeCertificateEdition(edition);
  const [{ data: eligible, error }, { data: issued, error: issuedError }] =
    await Promise.all([
      db()
        .from('attendee_certificate_eligible')
        .select('registration_id,first_name,last_name,email')
        .limit(5000),
      db()
        .from('attendee_certificates')
        .select('registration_id')
        .eq('edition', selected)
        .limit(5000),
    ]);
  if (error) throw new Error(error.message);
  if (issuedError) throw new Error(issuedError.message);
  const have = new Set((issued || []).map((row) => row.registration_id));
  return (eligible || []).filter((row) => !have.has(row.registration_id));
}

function newRow({ edition, name, email, registrationId, source, operator }) {
  return {
    edition,
    registration_id: registrationId || null,
    code: newCertificateCode(edition),
    claim_token_hash: hashClaimToken(newClaimToken()),
    recipient_name: name,
    original_name: name,
    email: String(email).trim().toLowerCase(),
    source,
    created_by_email: operator?.primaryEmail || null,
  };
}

// Issues certificates for every eligible attendee who has none yet. The
// download link is created later, when the certificate is emailed.
export async function issueEligibleCertificates({ edition, operator }) {
  const selected = normalizeCertificateEdition(edition);
  const pending = await listEligibleWithoutCertificate({ edition: selected });
  let issued = 0;
  const skipped = [];
  for (const person of pending) {
    let name = nameFromRegistration({
      firstName: person.first_name,
      lastName: person.last_name,
    });
    try {
      name = validateCertificateName(name);
    } catch {
      skipped.push({
        email: person.email,
        name,
        reason: 'Name needs checking',
      });
      continue;
    }
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const row = newRow({
        edition: selected,
        name,
        email: person.email,
        registrationId: person.registration_id,
        source: 'check-in',
        operator,
      });
      const { data, error } = await db()
        .from('attendee_certificates')
        .insert(row)
        .select('id')
        .single();
      if (!error) {
        issued += 1;
        await logCertificateEvent(
          data.id,
          'issued',
          { source: 'check-in' },
          operator?.primaryEmail
        );
        break;
      }
      // A clash on the random code is retried; a clash on the registration
      // means another issue run got there first.
      if (isDuplicate(error) && /code/i.test(error.message) && attempt < 2)
        continue;
      if (isDuplicate(error)) break;
      throw new Error(error.message);
    }
  }
  return { issued, skipped };
}

// For attendees who came but were not scanned in, added by an admin.
export async function issueManualCertificate({
  edition,
  name,
  email,
  operator,
}) {
  const selected = normalizeCertificateEdition(edition);
  const cleanName = validateCertificateName(name);
  const cleanEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('A valid email address is required.');
  }
  const { data: reg } = await db()
    .from('event_registrations')
    .select('id,speaker_flag,priority_tier')
    .ilike('email', cleanEmail)
    .eq('status', 'confirmed')
    .limit(1)
    .maybeSingle();
  if (reg && (reg.speaker_flag || reg.priority_tier === 'Speakers')) {
    throw new Error(
      'This email belongs to a speaker. Speakers get a separate certificate.'
    );
  }
  const { data: existing } = await db()
    .from('attendee_certificates')
    .select('code')
    .eq('edition', selected)
    .ilike('email', cleanEmail)
    .limit(1)
    .maybeSingle();
  if (existing)
    throw new Error(`This email already has certificate ${existing.code}.`);

  const row = newRow({
    edition: selected,
    name: cleanName,
    email: cleanEmail,
    registrationId: reg?.id,
    source: 'manual',
    operator,
  });
  const { data, error } = await db()
    .from('attendee_certificates')
    .insert(row)
    .select(CERT_SELECT)
    .single();
  if (error)
    throw new Error(
      isDuplicate(error)
        ? 'This attendee already has a certificate.'
        : error.message
    );
  await logCertificateEvent(
    data.id,
    'issued',
    { source: 'manual' },
    operator?.primaryEmail
  );
  return normalizeCertificateRow(data);
}

export async function getCertificateById(id) {
  const { data, error } = await db()
    .from('attendee_certificates')
    .select(CERT_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Certificate not found.');
  return normalizeCertificateRow(data);
}

export async function getCertificateDetail(id) {
  const certificate = await getCertificateById(id);
  const { data, error } = await db()
    .from('attendee_certificate_events')
    .select('id,event_type,detail,actor_email,created_at')
    .eq('certificate_id', id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return { certificate, events: data || [] };
}

export async function getCertificateByToken(token) {
  const { data, error } = await db()
    .from('attendee_certificates')
    .select(CERT_SELECT)
    .eq('claim_token_hash', hashClaimToken(token))
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizeCertificateRow(data) : null;
}

// Public verification returns only what is printed on the certificate.
export async function getCertificateForVerification(code) {
  const { data, error } = await db()
    .from('attendee_certificates')
    .select('code,edition,recipient_name,status,issued_at')
    .eq('code', code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    code: data.code,
    edition: data.edition,
    name: data.recipient_name,
    status: data.status,
    issuedAt: data.issued_at,
  };
}

export async function findActiveCertificatesByEmail({ edition, email }) {
  const { data, error } = await db()
    .from('attendee_certificates')
    .select(CERT_SELECT)
    .eq('edition', normalizeCertificateEdition(edition))
    .eq('status', 'active')
    .ilike('email', String(email || '').trim())
    .limit(5);
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeCertificateRow);
}

export async function recordCertificateDownload(certificate) {
  const now = new Date().toISOString();
  const { error } = await db()
    .from('attendee_certificates')
    .update({
      download_count: certificate.downloadCount + 1,
      first_downloaded_at: certificate.firstDownloadedAt || now,
      last_downloaded_at: now,
    })
    .eq('id', certificate.id);
  if (error) console.error('Certificate download not recorded.', error.message);
  await logCertificateEvent(certificate.id, 'downloaded');
}

export async function changeCertificateNameByToken({ token, name }) {
  const cleanName = validateCertificateName(name);
  const { data, error } = await db().rpc('change_attendee_certificate_name', {
    p_token_hash: hashClaimToken(token),
    p_new_name: cleanName,
  });
  if (error) {
    if (error.code === 'P0002') throw new Error('Certificate not found.');
    throw new Error(error.message);
  }
  return normalizeCertificateRow(data);
}

// Admin correction of name or email; not counted against the attendee's
// own name changes.
export async function updateCertificateByAdmin({ id, name, email, operator }) {
  const current = await getCertificateById(id);
  const patch = { updated_at: new Date().toISOString() };
  const detail = {};
  if (name !== undefined) {
    const clean = validateCertificateName(name);
    if (clean !== current.name) {
      patch.recipient_name = clean;
      patch.pdf_sha256 = null;
      detail.name = { from: current.name, to: clean };
    }
  }
  if (email !== undefined) {
    const clean = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean))
      throw new Error('A valid email address is required.');
    if (clean !== current.email) {
      patch.email = clean;
      detail.email = { from: current.email, to: clean };
    }
  }
  if (!Object.keys(detail).length) return current;
  const { data, error } = await db()
    .from('attendee_certificates')
    .update(patch)
    .eq('id', id)
    .neq('email_status', 'sending')
    .select(CERT_SELECT)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data)
    throw new Error(
      'This certificate cannot be edited while an email is being sent.'
    );
  await logCertificateEvent(
    id,
    'name_changed',
    { ...detail, by: 'admin' },
    operator?.primaryEmail
  );
  return normalizeCertificateRow(data);
}

export async function setCertificateRevoked({ id, revoked, reason, operator }) {
  const now = new Date().toISOString();
  const patch = revoked
    ? {
        status: 'revoked',
        revoked_reason:
          String(reason || '')
            .trim()
            .slice(0, 300) || 'Revoked by organiser',
        revoked_at: now,
        revoked_by_email: operator?.primaryEmail || null,
        updated_at: now,
      }
    : {
        status: 'active',
        revoked_reason: null,
        revoked_at: null,
        revoked_by_email: null,
        updated_at: now,
      };
  const { data, error } = await db()
    .from('attendee_certificates')
    .update(patch)
    .eq('id', id)
    .select(CERT_SELECT)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Certificate not found.');
  await logCertificateEvent(
    id,
    revoked ? 'revoked' : 'reinstated',
    revoked ? { reason: patch.revoked_reason } : {},
    operator?.primaryEmail
  );
  return normalizeCertificateRow(data);
}

// A fresh download link, stored only as a hash. Each email gets a new link;
// earlier links stop working.
export async function rotateClaimToken(id) {
  const token = newClaimToken();
  const { error } = await db()
    .from('attendee_certificates')
    .update({
      claim_token_hash: hashClaimToken(token),
      token_expires_at: linkExpiryFrom(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return token;
}

export async function claimCertificateSend({
  certificate,
  operator,
  kind = 'certificate',
}) {
  const { data, error } = await db().rpc('claim_attendee_certificate_send', {
    p_certificate_id: certificate.id,
    p_expected_updated_at: certificate.updatedAt,
    p_actor_clerk_id: operator?.userId || null,
    p_actor_email: operator?.primaryEmail || null,
    p_kind: kind,
  });
  if (error || !data) {
    throw new Error(
      error?.code === 'P0001' || error?.code === '23505' || !data
        ? 'This certificate is already being sent. Check its delivery before trying again.'
        : error.message
    );
  }
  return data;
}

async function finishSend(params) {
  const { data, error } = await db().rpc(
    'finish_attendee_certificate_send',
    params
  );
  if (error) throw new Error(error.message);
  return normalizeCertificateRow(data);
}

export function markCertificateSent({ attemptId, providerMessageId }) {
  return finishSend({
    p_attempt_id: attemptId,
    p_outcome: 'accepted',
    p_provider_message_id: providerMessageId,
  });
}

export function markCertificateSendFailed({ attemptId, errorMessage }) {
  return finishSend({
    p_attempt_id: attemptId,
    p_outcome: 'failed',
    p_failure_reason: String(errorMessage || 'Email was not sent.').slice(
      0,
      1000
    ),
  });
}

export async function prepareCertificateSendRequest(attemptId, requestSha256) {
  const { data, error } = await db()
    .from('attendee_certificate_deliveries')
    .update({
      request_sha256: requestSha256,
      updated_at: new Date().toISOString(),
    })
    .eq('id', attemptId)
    .eq('delivery_status', 'sending')
    .is('request_sha256', null)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('This send attempt is no longer open.');
}

export async function confirmCertificateNameByToken(token) {
  const { data, error } = await db().rpc('confirm_attendee_certificate_name', {
    p_token_hash: hashClaimToken(token),
  });
  if (error) {
    if (error.code === 'P0002') throw new Error('Certificate not found.');
    throw new Error(error.message);
  }
  return normalizeCertificateRow(data);
}

// The fingerprint of the PDF as issued, so a file can be checked later.
export async function recordCertificatePdfHash(id, sha256) {
  const { error } = await db()
    .from('attendee_certificates')
    .update({ pdf_sha256: sha256 })
    .eq('id', id);
  if (error)
    console.error('Certificate fingerprint not stored.', error.message);
}

export async function findCertificateByPdfHash(sha256) {
  const { data, error } = await db()
    .from('attendee_certificates')
    .select('code,recipient_name,status')
    .eq('pdf_sha256', sha256)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data
    ? { code: data.code, name: data.recipient_name, status: data.status }
    : null;
}

// Issues a one-time email code. At most three codes per 15 minutes per
// certificate; each code lasts 10 minutes and allows five attempts.
export async function createCertificateEmailCode(certificateId) {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count, error: countError } = await db()
    .from('attendee_certificate_codes')
    .select('id', { count: 'exact', head: true })
    .eq('certificate_id', certificateId)
    .gte('created_at', since);
  if (countError) throw new Error(countError.message);
  if ((count || 0) >= 3) {
    throw new Error(
      'Too many codes requested. Please wait 15 minutes and try again.'
    );
  }
  const code = newEmailCode();
  const { error } = await db()
    .from('attendee_certificate_codes')
    .insert({
      certificate_id: certificateId,
      code_hash: hashEmailCode({ certificateId, code }),
      expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
    });
  if (error) throw new Error(error.message);
  await logCertificateEvent(certificateId, 'code_sent');
  return code;
}

export async function verifyCertificateEmailCode({ certificateId, code }) {
  const clean = String(code || '').replace(/\D/g, '');
  const { data: row, error } = await db()
    .from('attendee_certificate_codes')
    .select('id,code_hash,expires_at,attempts,consumed_at')
    .eq('certificate_id', certificateId)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row || Date.parse(row.expires_at) <= Date.now()) {
    throw new Error('This code has expired. Please request a new one.');
  }
  if (row.attempts >= MAX_CODE_ATTEMPTS) {
    throw new Error('Too many wrong attempts. Please request a new code.');
  }
  if (
    clean.length !== 6 ||
    hashEmailCode({ certificateId, code: clean }) !== row.code_hash
  ) {
    await db()
      .from('attendee_certificate_codes')
      .update({ attempts: row.attempts + 1 })
      .eq('id', row.id);
    await logCertificateEvent(certificateId, 'code_failed');
    const left = MAX_CODE_ATTEMPTS - row.attempts - 1;
    throw new Error(
      left > 0
        ? `That code is not right. ${left} attempt${left === 1 ? '' : 's'} left.`
        : 'Too many wrong attempts. Please request a new code.'
    );
  }
  await db()
    .from('attendee_certificate_codes')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', row.id);
  await logCertificateEvent(certificateId, 'code_verified');
}

// The attendee's festival photo folder, if we found them in the photos.
export async function getCertificatePhotos(certificate) {
  if (!certificate?.registrationId) return null;
  const { data, error } = await db()
    .from('attendee_certificate_photos')
    .select('folder_url, photo_count')
    .eq('registration_id', certificate.registrationId)
    .eq('edition', certificate.edition)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? { url: data.folder_url, count: data.photo_count } : null;
}
