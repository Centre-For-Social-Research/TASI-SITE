'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { register } = require('node:module');

const SRC_ROOT = pathToFileURL(path.join(__dirname, '..', 'src')).href + '/';
register(
  `data:text/javascript,
    const root = ${JSON.stringify(SRC_ROOT)};
    export async function resolve(specifier, context, nextResolve) {
      if (specifier.startsWith('@/')) {
        let target = root + specifier.slice(2);
        if (!target.endsWith('.js') && !target.endsWith('.ts')) target += '.js';
        return nextResolve(target, context);
      }
      return nextResolve(specifier, context);
    }
  `,
  { parentURL: pathToFileURL(__filename).href }
);

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

async function importModule(relativePath) {
  return import(pathToFileURL(path.join(process.cwd(), relativePath)).href);
}

test('Azure WhatsApp normalizes only safe recipient phone numbers', async () => {
  const { normalizeWhatsAppRecipientPhone } = await importModule(
    'src/lib/azure-whatsapp.js'
  );

  assert.equal(
    normalizeWhatsAppRecipientPhone({ phone: '+91 98765 43210' }),
    '+919876543210'
  );
  assert.equal(
    normalizeWhatsAppRecipientPhone({ phone: '9876543210', country: 'India' }),
    '+919876543210'
  );
  assert.equal(
    normalizeWhatsAppRecipientPhone({ phone: '12345', country: 'India' }),
    ''
  );
});

test('Azure WhatsApp is opt-in and requires channel credentials', async () => {
  const previous = {
    AZURE_WHATSAPP_ENABLED: process.env.AZURE_WHATSAPP_ENABLED,
    AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING:
      process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING,
    AZURE_WHATSAPP_CHANNEL_REGISTRATION_ID:
      process.env.AZURE_WHATSAPP_CHANNEL_REGISTRATION_ID,
  };

  delete process.env.AZURE_WHATSAPP_ENABLED;
  delete process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING;
  delete process.env.AZURE_WHATSAPP_CHANNEL_REGISTRATION_ID;

  try {
    const { getAzureWhatsAppConfig, isAzureWhatsAppConfigured } =
      await importModule('src/lib/azure-whatsapp.js');
    assert.equal(isAzureWhatsAppConfigured(getAzureWhatsAppConfig()), false);

    process.env.AZURE_WHATSAPP_ENABLED = 'true';
    process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING =
      'endpoint=https://example.communication.azure.com/;accesskey=test';
    process.env.AZURE_WHATSAPP_CHANNEL_REGISTRATION_ID = 'channel-id';
    assert.equal(isAzureWhatsAppConfigured(getAzureWhatsAppConfig()), true);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('registration email jobs trigger optional WhatsApp after successful email only', () => {
  const source = read('src/lib/registration-email-job-service.js');

  assert.match(source, /deliverRegistrationEmail/);
  assert.match(source, /deliverHighPriorityRegistrationWhatsApp/);
  assert.match(source, /await sendRegistrationWhatsApp\(/);
  assert.match(source, /if \(!emailResult\.sent\)/);
});

test('QR pass delivery triggers optional WhatsApp without replacing Resend email', () => {
  const source = read('src/lib/pass-issue-job-service.js');

  assert.match(source, /deliverRegistrationEmail/);
  assert.match(source, /deliverHighPriorityRegistrationWhatsApp/);
  assert.match(source, /templateType: 'qr_pass_issued'/);
});

test('schema supports separate email and WhatsApp notification audit rows', () => {
  const schema = read('supabase/schema.sql');

  assert.match(schema, /delivery_channel text not null default 'email'/);
  assert.match(schema, /recipient_phone text/);
  assert.match(schema, /'email', 'whatsapp'/);
  assert.match(schema, /'skipped'/);
  assert.match(schema, /idx_registration_notifications_channel/);
});
