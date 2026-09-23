const test = require('node:test');
const assert = require('node:assert/strict');

const {
  resolveRegistrationReviewFields,
} = require('../src/lib/registration-review-update.cjs');

const existing = {
  review_notes: 'Needs step-free access',
  speaker_flag: true,
  vip_flag: true,
};

test('status-only updates preserve existing review notes and flags', () => {
  assert.deepEqual(resolveRegistrationReviewFields(existing, {}), {
    reviewNotes: 'Needs step-free access',
    speakerFlag: true,
    vipFlag: true,
  });
});

test('explicit review edits can clear notes and flags', () => {
  assert.deepEqual(
    resolveRegistrationReviewFields(existing, {
      reviewNotes: '  ',
      speakerFlag: false,
      vipFlag: false,
    }),
    { reviewNotes: '', speakerFlag: false, vipFlag: false }
  );
});
