const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {
  PUBLIC_FORMS,
  FORM_CLOSED_MESSAGE,
  buildFormStatuses,
  isPublicFormKey,
} = require('../src/lib/form-settings.cjs');

test('forms without a stored row are open', () => {
  const statuses = buildFormStatuses([]);
  assert.equal(statuses.length, PUBLIC_FORMS.length);
  assert.ok(statuses.every((form) => form.open));
});

test('stored rows close only their own form', () => {
  const statuses = buildFormStatuses([
    {
      form_key: 'registration',
      is_open: false,
      updated_by_email: 'admin@example.com',
      updated_at: '2026-10-12T00:00:00.000Z',
    },
    { form_key: 'not_a_form', is_open: false },
  ]);
  const byKey = Object.fromEntries(statuses.map((form) => [form.key, form]));
  assert.equal(byKey.registration.open, false);
  assert.equal(byKey.registration.updatedBy, 'admin@example.com');
  assert.equal(byKey.speaker_application.open, true);
  assert.equal(statuses.length, PUBLIC_FORMS.length);
});

test('newsletter is not a closable form', () => {
  assert.equal(isPublicFormKey('newsletter'), false);
  assert.equal(isPublicFormKey('registration'), true);
});

test('migration allows exactly the closable form keys', () => {
  const migration = fs.readFileSync(
    'supabase/migrations/20261012090000_form_settings.sql',
    'utf8'
  );
  for (const form of PUBLIC_FORMS) {
    assert.ok(migration.includes(`'${form.key}'`), form.key);
  }
  assert.ok(
    fs.readFileSync('supabase/schema.sql', 'utf8').includes('form_settings')
  );
});

test('each public form API checks its switch before doing any work', () => {
  const routes = {
    registration: 'src/app/api/registrations/create/route.js',
    speaker_application: 'src/app/api/speaker-application/route.js',
    volunteer_application: 'src/app/api/volunteer-application/route.js',
    media_accreditation: 'src/app/api/media-accreditation/route.js',
    exhibition_enquiry: 'src/app/api/messages/route.js',
  };
  for (const [key, path] of Object.entries(routes)) {
    const source = fs.readFileSync(path, 'utf8');
    const gate = source.indexOf(`isFormOpen('${key}')`);
    assert.ok(gate > 0, `${path} checks ${key}`);
    assert.ok(source.includes('formClosedResponse('), path);
    // /api/messages is shared, so it reads the body to see which form sent it.
    if (key !== 'exhibition_enquiry') {
      assert.ok(
        gate < source.indexOf('await request.'),
        `${path} gates before reading the body`
      );
    }
  }
  assert.ok(
    !fs
      .readFileSync('src/app/api/newsletter/subscribe/route.js', 'utf8')
      .includes('isFormOpen')
  );
});

test('each form page shows the closed notice from its switch', () => {
  const pages = {
    registration: 'src/app/register/page.jsx',
    speaker_application: 'src/app/speaker-application/page.jsx',
    volunteer_application: 'src/app/volunteer-application/page.jsx',
    media_accreditation: 'src/app/media/accreditation/page.jsx',
    exhibition_enquiry: 'src/app/exhibition/page.jsx',
  };
  for (const [key, path] of Object.entries(pages)) {
    assert.ok(
      fs.readFileSync(path, 'utf8').includes(`isFormOpen('${key}')`),
      path
    );
  }
  assert.ok(
    fs
      .readFileSync('src/components/ui/form-closed-notice.jsx', 'utf8')
      .includes('FORM_CLOSED_MESSAGE')
  );
  assert.match(FORM_CLOSED_MESSAGE, /closed/);
});
