const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  normalizeGuestInvitationInput,
  normalizeGuestInvitationRow,
} = require('../src/lib/guest-invitation-utils.cjs');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('guest invitation input accepts only the agreed guest fields', () => {
  assert.deepEqual(
    normalizeGuestInvitationInput({
      name: ' Saquib <Reja> ',
      email: ' SAQUIB@CSRINDIA.ORG ',
      designation: ' Founder ',
      organization: ' CSR ',
      qrToken: 'must-not-be-used',
    }),
    {
      guestName: 'Saquib Reja',
      email: 'saquib@csrindia.org',
      designation: 'Founder',
      organization: 'CSR',
    }
  );
});

test('guest invitation input requires a name and a valid email', () => {
  assert.throws(
    () => normalizeGuestInvitationInput({ name: '', email: 'a@example.org' }),
    /Guest name is required/
  );
  assert.throws(
    () => normalizeGuestInvitationInput({ name: 'Guest', email: 'not-email' }),
    /valid email address/
  );
});

test('guest invitation row retains only its manual invitation delivery state', () => {
  assert.deepEqual(
    normalizeGuestInvitationRow({
      id: 'guest-1',
      guest_name: 'Saquib',
      email: 'saquib@csrindia.org',
      status: 'sent',
      send_count: 2,
      last_provider_message_id: 'email_123',
    }),
    {
      id: 'guest-1',
      name: 'Saquib',
      email: 'saquib@csrindia.org',
      designation: '',
      organization: '',
      status: 'sent',
      templateVersion: 'guest_invitation_v1',
      sendCount: 2,
      firstSentAt: null,
      lastSentAt: null,
      lastProviderMessageId: 'email_123',
      lastError: null,
      createdByEmail: null,
      lastSentByEmail: null,
      createdAt: null,
      updatedAt: null,
    }
  );
});

test('guest invitation schema is isolated from registration, pass, and check-in tables', () => {
  const schema = readSource('supabase/schema.sql');
  const invitationSection = schema.slice(
    schema.indexOf('create table if not exists public.guest_invitations'),
    schema.indexOf('drop policy if exists "Deny guest invitations api access"')
  );

  assert.match(schema, /create table if not exists public\.guest_invitations/);
  assert.match(
    schema,
    /create table if not exists public\.guest_invitation_deliveries/
  );
  assert.match(schema, /recipient_email text not null/);
  assert.match(
    schema,
    /alter table public\.guest_invitations enable row level security/
  );
  assert.match(schema, /Deny guest invitations api access/);
  assert.doesNotMatch(
    invitationSection,
    /event_registrations|entry_passes|registration_daily_check_ins|entry_scans/
  );
});

test('guest invitation routes require admin authorization for mutations and use only the manual invitation service', () => {
  const collectionRoute = readSource(
    'src/app/api/admin/guest-invitations/route.js'
  );
  const itemRoute = readSource(
    'src/app/api/admin/guest-invitations/[id]/route.js'
  );
  const sendRoute = readSource(
    'src/app/api/admin/guest-invitations/[id]/send/route.js'
  );
  const panel = readSource('src/components/admin/guest-invitations-panel.jsx');

  assert.match(collectionRoute, /requireAdminOperator/);
  assert.match(itemRoute, /requireAdminOperator/);
  assert.match(sendRoute, /requireAdminOperator/);
  assert.match(sendRoute, /claimGuestInvitationSend/);
  assert.match(sendRoute, /markGuestInvitationSent/);
  assert.doesNotMatch(
    sendRoute,
    /event_registrations|entry_passes|createPassIssueEmailJob|QR/
  );
  assert.match(
    panel,
    /does not create a registration, QR pass, or check-in credential/i
  );
  assert.doesNotMatch(panel, /bulk send/i);
});
