const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const VALID_DAYS = new Set(['oct13', 'oct14', 'oct15']);

// Rooms that run a single session at a time. Reception and Lobby entries
// deliberately share a slot (parallel spotlights, open networking windows).
const EXCLUSIVE_ROOMS = new Set([
  'Main Hall',
  'Workshop Room',
  'Roundtable Room',
]);

function loadSessions() {
  const moduleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/data/programme-2026.js')
  ).href;
  return import(moduleUrl).then((mod) => mod.programmeSessions2026);
}

function parseRange(time) {
  const [start, end] = String(time)
    .replace(/[–—]/g, '-')
    .split('-')
    .map((part) => part.trim());

  const toMinutes = (value) => {
    const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  };

  return { start: toMinutes(start), end: toMinutes(end) };
}

test('2026 agenda publishes session titles without any speaker names', async () => {
  const sessions = await loadSessions();

  for (const session of sessions) {
    assert.deepEqual(
      session.speakers,
      [],
      `${session.id} must not carry speaker names until the line-up is confirmed`
    );
  }
});

test('2026 agenda carries no draft placeholders or unconfirmed markers', async () => {
  const sessions = await loadSessions();
  const forbidden = [
    /\bTBC\b/i,
    /\bTBD\b/i,
    /\bCONFIRMED\b/i,
    /\bINVITED\b/i,
    /\bOPEN SLOT\b/i,
    /[[\]]/,
  ];

  for (const session of sessions) {
    const text = `${session.title} ${session.description}`;
    for (const pattern of forbidden) {
      assert.ok(
        !pattern.test(text),
        `${session.id} leaks a draft marker matching ${pattern}: "${text}"`
      );
    }
  }
});

test('2026 agenda uses unique ids and valid day keys', async () => {
  const sessions = await loadSessions();
  const ids = sessions.map((session) => session.id);

  assert.equal(new Set(ids).size, ids.length, 'session ids must be unique');

  for (const session of sessions) {
    assert.ok(
      VALID_DAYS.has(session.day),
      `${session.id} has an unexpected day key: ${session.day}`
    );
    assert.ok(session.title.trim().length > 0, `${session.id} needs a title`);
    assert.ok(
      session.venue && session.track,
      `${session.id} needs a venue and track`
    );
  }
});

test('2026 agenda time ranges are well formed and end after they start', async () => {
  const sessions = await loadSessions();

  for (const session of sessions) {
    const { start, end } = parseRange(session.time);
    assert.ok(
      typeof start === 'number' && typeof end === 'number',
      `${session.id} has an unparseable time: ${session.time}`
    );
    assert.ok(
      end > start,
      `${session.id} ends before it starts: ${session.time}`
    );
  }
});

test('2026 agenda never double-books a single-track room', async () => {
  const sessions = await loadSessions();
  const byRoomAndDay = new Map();

  for (const session of sessions) {
    const room = session.venue || session.track;
    if (!EXCLUSIVE_ROOMS.has(room)) continue;

    const key = `${session.day}::${room}`;
    if (!byRoomAndDay.has(key)) byRoomAndDay.set(key, []);
    byRoomAndDay.get(key).push(session);
  }

  for (const [key, roomSessions] of byRoomAndDay) {
    const ordered = roomSessions
      .map((session) => ({ ...session, ...parseRange(session.time) }))
      .sort((a, b) => a.start - b.start);

    for (let index = 1; index < ordered.length; index += 1) {
      const previous = ordered[index - 1];
      const current = ordered[index];

      assert.ok(
        current.start >= previous.end,
        `${key} double-books: "${previous.title}" (${previous.time}) overlaps "${current.title}" (${current.time})`
      );
    }
  }
});
