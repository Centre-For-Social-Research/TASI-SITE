const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getCountdown,
  getFestivalPhase,
} = require('../src/lib/festival-phase.cjs');
const {
  liveProgrammeSessions2026: sessions,
} = require('../src/data/programme-2026.js');

const ist = (value) => new Date(`${value}+05:30`);
const phase = (value) => getFestivalPhase(sessions, ist(value)).phase;

test('the homepage counts down until doors open at 09:00 on 14 October', () => {
  assert.equal(phase('2026-10-03T12:00:00'), 'countdown');
  assert.equal(phase('2026-10-13T19:00:00'), 'countdown');
  assert.equal(phase('2026-10-14T08:59:00'), 'countdown');
  assert.equal(phase('2026-10-14T09:00:00'), 'live');
});

test('the countdown is exact to the minute in IST', () => {
  assert.deepEqual(getCountdown(ist('2026-10-03T12:00:00')), {
    days: 10,
    hours: 21,
    minutes: 0,
  });
  assert.deepEqual(getCountdown(ist('2026-10-14T08:30:30')), {
    days: 0,
    hours: 0,
    minutes: 30,
  });
  assert.deepEqual(getCountdown(ist('2026-10-14T10:00:00')), {
    days: 0,
    hours: 0,
    minutes: 0,
  });
});

test('both festival days are live, including the evening of day 1', () => {
  assert.equal(phase('2026-10-14T13:45:00'), 'live');
  assert.equal(phase('2026-10-14T21:00:00'), 'live');
  assert.equal(phase('2026-10-15T08:00:00'), 'live');
  assert.equal(phase('2026-10-15T12:05:00'), 'live');
});

test('thanks shows after the last session on 15 October and stops at the end of 2026', () => {
  assert.equal(phase('2026-10-15T17:30:00'), 'thanks');
  assert.equal(phase('2026-10-20T10:00:00'), 'thanks');
  assert.equal(phase('2026-12-31T23:59:00'), 'thanks');
  assert.equal(phase('2027-01-01T00:00:00'), 'none');
});
