const test = require('node:test');
const assert = require('node:assert/strict');

const {
  formatIstClock,
  getLiveProgramme,
  getSessionLiveStatus,
} = require('../src/lib/live-programme.cjs');

const ist = (value) => new Date(`${value}+05:30`);

const sessions = [
  {
    id: 'r',
    day: 'oct13',
    time: '18:00–20:00',
    venue: 'German Embassy',
    title: 'Opening Reception',
  },
  {
    id: 'reg',
    day: 'oct14',
    time: '09:00–10:00',
    venue: 'Lobby',
    title: 'Registration',
  },
  {
    id: 'a',
    day: 'oct14',
    time: '10:00–10:30',
    venue: 'Main Hall',
    title: 'Opening',
  },
  {
    id: 'b',
    day: 'oct14',
    time: '10:30–11:15',
    venue: 'Main Hall',
    title: 'Panel',
  },
  {
    id: 'w',
    day: 'oct14',
    time: '10:00–11:00',
    venue: 'Workshop Room',
    title: 'Workshop',
  },
  {
    id: 'rt',
    day: 'oct14',
    time: '11:30–12:00',
    venue: 'Roundtable Room',
    title: 'Roundtable',
  },
  {
    id: 'lunch',
    day: 'oct14',
    time: '13:30–14:15',
    venue: 'Lobby',
    title: 'Lunch Break',
  },
  {
    id: 'c',
    day: 'oct15',
    time: '10:00–11:00',
    venue: 'Main Hall',
    title: 'Day two',
  },
  {
    id: 'nl',
    day: 'oct15',
    time: '18:00–20:00',
    venue: 'Embassy of the Netherlands',
    title: 'Closing Reception',
  },
];

const room = (live, name) => live.rooms.find((item) => item.room === name);

test('outside 14-15 October nothing is live', () => {
  assert.equal(
    getLiveProgramme(sessions, ist('2026-10-13T19:00:00')).state,
    'inactive'
  );
  assert.equal(
    getLiveProgramme(sessions, ist('2026-10-16T10:00:00')).state,
    'inactive'
  );
  assert.equal(
    getLiveProgramme(sessions, ist('2027-10-14T10:00:00')).state,
    'inactive'
  );
});

test('before the first session the day is waiting to start', () => {
  const live = getLiveProgramme(sessions, ist('2026-10-14T08:15:00'));
  assert.equal(live.state, 'before');
  assert.equal(live.firstSession.id, 'reg');
  assert.equal(room(live, 'Main Hall').next.id, 'a');
  assert.equal(room(live, 'Main Hall').later.id, 'b');
});

test('each room shows what is on now and what is next', () => {
  const live = getLiveProgramme(sessions, ist('2026-10-14T10:20:00'));
  const main = room(live, 'Main Hall');

  assert.equal(live.state, 'live');
  assert.equal(main.now.id, 'a');
  assert.equal(main.now.minutesLeft, 10);
  assert.ok(main.now.progress > 0.6 && main.now.progress < 0.7);
  assert.equal(main.next.id, 'b');
  assert.equal(room(live, 'Workshop Room').now.id, 'w');
  assert.equal(room(live, 'Roundtable Room').now, null);
  assert.equal(room(live, 'Roundtable Room').next.minutesUntil, 70);
});

test('a session ends exactly at its end time and the next takes over', () => {
  const live = getLiveProgramme(sessions, ist('2026-10-14T10:30:00'));
  assert.equal(room(live, 'Main Hall').now.id, 'b');
});

test('the lobby carries shared moments like lunch', () => {
  const live = getLiveProgramme(sessions, ist('2026-10-14T13:40:00'));
  assert.equal(live.lobby.now.id, 'lunch');
});

test('after the last session day 1 points to day 2, and day 2 ends the run', () => {
  assert.equal(
    getLiveProgramme(sessions, ist('2026-10-14T15:00:00')).state,
    'after'
  );
  assert.equal(
    getLiveProgramme(sessions, ist('2026-10-14T15:00:00')).nextDay.key,
    'oct15'
  );
  assert.equal(
    getLiveProgramme(sessions, ist('2026-10-14T15:00:00')).nextDayStart,
    '10:00'
  );
  assert.equal(
    getLiveProgramme(sessions, ist('2026-10-15T12:00:00')).state,
    'ended'
  );
});

test('off-site evening receptions are never shown as now or next', () => {
  const live = getLiveProgramme(sessions, ist('2026-10-15T18:30:00'));
  assert.equal(live.state, 'ended');
  for (const item of live.rooms) {
    assert.equal(item.now, null);
  }
});

test('the result is the same whatever timezone the device is in', () => {
  const moment = Date.parse('2026-10-14T04:50:00Z'); // 10:20 IST
  assert.equal(
    room(getLiveProgramme(sessions, moment), 'Main Hall').now.id,
    'a'
  );
  assert.equal(formatIstClock(moment), '10:20');
});

test('programme cards know whether a session is live, past or upcoming', () => {
  const now = ist('2026-10-14T10:20:00');
  assert.equal(getSessionLiveStatus(sessions[2], now), 'live');
  assert.equal(getSessionLiveStatus(sessions[1], now), 'past');
  assert.equal(getSessionLiveStatus(sessions[3], now), 'upcoming');
  assert.equal(getSessionLiveStatus(sessions[7], now), 'upcoming');
  assert.equal(
    getSessionLiveStatus(sessions[7], ist('2026-10-16T10:00:00')),
    null
  );
});

// Runs the real programme through every minute of both festival days, so a
// programme edit that creates a clash or a bad time fails CI before the event.
test('the real TASI 2026 programme stays consistent minute by minute', () => {
  const {
    liveProgrammeSessions2026,
  } = require('../src/data/programme-2026.js');
  const { ROOMS } = require('../src/lib/live-programme.cjs');

  assert.ok(liveProgrammeSessions2026.length > 20);

  for (const [date, dayKey] of [
    ['2026-10-14', 'oct14'],
    ['2026-10-15', 'oct15'],
  ]) {
    // No two sessions overlap in the same room.
    for (const roomName of [...ROOMS, 'Lobby']) {
      const slots = liveProgrammeSessions2026
        .filter((item) => item.day === dayKey && item.venue === roomName)
        .map((item) => {
          const [start, end] = item.time.split('–');
          assert.match(start, /^\d{2}:\d{2}$/, `${item.id} start`);
          assert.match(end, /^\d{2}:\d{2}$/, `${item.id} end`);
          assert.ok(start < end, `${item.id} ends after it starts`);
          return { id: item.id, start, end };
        })
        .sort((a, b) => a.start.localeCompare(b.start));
      for (let i = 1; i < slots.length; i += 1) {
        assert.ok(
          slots[i].start >= slots[i - 1].end,
          `${slots[i - 1].id} and ${slots[i].id} overlap in ${roomName}`
        );
      }
    }

    const seenLive = new Set();
    for (let minute = 6 * 60; minute <= 22 * 60; minute += 1) {
      const hh = String(Math.floor(minute / 60)).padStart(2, '0');
      const mm = String(minute % 60).padStart(2, '0');
      const now = new Date(`${date}T${hh}:${mm}:00+05:30`);
      const live = getLiveProgramme(liveProgrammeSessions2026, now);

      assert.notEqual(live.state, 'inactive', `${date} ${hh}:${mm}`);
      for (const item of live.rooms || []) {
        if (item.now) {
          seenLive.add(item.now.id);
          assert.ok(item.now.progress >= 0 && item.now.progress < 1);
          assert.ok(item.now.minutesLeft >= 1);
        }
        if (item.next) {
          assert.ok(item.next.start > now.getTime());
          assert.ok(item.next.minutesUntil >= 1);
        }
      }
    }

    for (const session of liveProgrammeSessions2026.filter(
      (item) => item.day === dayKey && ROOMS.includes(item.venue)
    )) {
      assert.ok(seenLive.has(session.id), `${session.id} is shown as live`);
    }
  }
});
