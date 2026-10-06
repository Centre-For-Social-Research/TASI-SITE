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

test('2026 speakers only come from the confirmed list and match the speaker directory', async () => {
  const sessions = await loadSessions();
  const { sessionSpeakers2026 } = await import(
    pathToFileURL(
      path.join(process.cwd(), 'src/data/programme-2026-speakers.js')
    ).href
  );
  const directory = require('../src/data/speakers-2026.json');
  const directoryNames = new Set(directory.map((speaker) => speaker.name));
  const sessionIds = new Set(sessions.map((session) => session.id));

  const nameOf = (entry) => (typeof entry === 'string' ? entry : entry.name);

  for (const [sessionId, entries] of Object.entries(sessionSpeakers2026)) {
    assert.ok(
      sessionIds.has(sessionId),
      `${sessionId} in programme-2026-speakers.js is not a programme session id`
    );
    assert.ok(
      Array.isArray(entries) && entries.length > 0,
      `${sessionId} lists speakers`
    );
    const names = entries.map(nameOf);
    assert.equal(
      new Set(names).size,
      names.length,
      `${sessionId} repeats a speaker`
    );
    for (const entry of entries) {
      if (typeof entry === 'string') {
        assert.ok(
          directoryNames.has(entry),
          `"${entry}" (${sessionId}) is not in speakers-2026.json; check the spelling or add their profile first`
        );
      } else {
        assert.ok(
          entry.name?.trim() && entry.title?.trim(),
          `${sessionId}: a speaker without a profile needs a name and title`
        );
        assert.ok(
          !directoryNames.has(entry.name),
          `"${entry.name}" (${sessionId}) has a profile; list them by name instead`
        );
      }
    }
  }

  for (const session of sessions) {
    const entries = sessionSpeakers2026[session.id] || [];
    assert.deepEqual(
      session.speakers,
      entries.map(nameOf),
      `${session.id} speakers must come from programme-2026-speakers.js`
    );
    const guests = entries.filter((entry) => typeof entry !== 'string');
    assert.deepEqual(
      session.guestSpeakers,
      guests.length
        ? Object.fromEntries(guests.map((guest) => [guest.name, guest.title]))
        : undefined,
      `${session.id} guest speaker titles must come from programme-2026-speakers.js`
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

test('renamed sessions keep working: old links resolve by session id', () => {
  const {
    buildProgrammeSessionSlug,
    findProgrammeSessionByLegacySlug,
    findProgrammeSessionBySlug,
  } = require('../src/lib/programme-agenda-utils.cjs');
  const sessions = [
    { id: 'tasi26-2', title: 'Short id session' },
    {
      id: 'tasi26-25',
      title: 'Policy Lab: Building Trusted Human Connections',
    },
  ];

  const oldLink =
    'tasi26-25-policy-lab-building-safer-online-social-discovery-ecosystems';
  assert.equal(findProgrammeSessionBySlug(sessions, oldLink), undefined);
  assert.equal(
    findProgrammeSessionByLegacySlug(sessions, oldLink).id,
    'tasi26-25'
  );
  assert.equal(
    findProgrammeSessionByLegacySlug(sessions, 'tasi26-25').id,
    'tasi26-25'
  );
  assert.equal(
    findProgrammeSessionByLegacySlug(sessions, 'tasi26-2-old').id,
    'tasi26-2'
  );
  assert.equal(
    findProgrammeSessionByLegacySlug(sessions, 'tasi26-99-gone'),
    null
  );
  assert.equal(
    buildProgrammeSessionSlug(sessions[1]),
    'tasi26-25-policy-lab-building-trusted-human-connections'
  );
});

test('2026 session speakers link to their 2026 profile with directory details', () => {
  const {
    buildProgrammeSessionViewModels,
  } = require('../src/lib/programme-agenda-utils.cjs');
  const {
    getSpeakerProfilePath,
  } = require('../src/lib/speaker-directory-utils.cjs');

  const [session] = buildProgrammeSessionViewModels({
    sessions: [
      {
        id: 'tasi26-25',
        title: 'Fireside',
        day: 'oct14',
        speakers: ['Yoel Roth'],
      },
    ],
    speakerDesignationMap: {
      'yoel roth': 'SVP, Head of Trust and Safety, Match Group',
    },
    speakerPhotoMap: { 'yoel roth': '/img/speakers/2026/yoel-roth.webp' },
    speakerEdition: '2026',
  });
  const [speaker] = session.speakersDetailed;

  assert.equal(speaker.title, 'SVP, Head of Trust and Safety, Match Group');
  assert.equal(speaker.photo, '/img/speakers/2026/yoel-roth.webp');
  assert.equal(getSpeakerProfilePath(speaker), '/speakers/2026/yoel-roth');
});

test('2026 speakers without a profile show their title and no profile link', () => {
  const {
    buildProgrammeSessionViewModels,
  } = require('../src/lib/programme-agenda-utils.cjs');

  const [session] = buildProgrammeSessionViewModels({
    sessions: [
      {
        id: 'tasi26-82',
        title: 'Fireside',
        day: 'oct14',
        speakers: ['Yoel Roth', 'Kevin Lee'],
        guestSpeakers: { 'Kevin Lee': 'CEO, Yuvaa' },
      },
    ],
    speakerDesignationMap: { 'yoel roth': 'SVP, Match Group' },
    speakerPhotoMap: { 'yoel roth': '/img/speakers/2026/yoel-roth.webp' },
    speakerEdition: '2026',
  });
  const [yoel, kevin] = session.speakersDetailed;

  assert.notEqual(yoel.hasProfile, false);
  assert.equal(yoel.photo, '/img/speakers/2026/yoel-roth.webp');
  assert.equal(kevin.hasProfile, false);
  assert.equal(kevin.title, 'CEO, Yuvaa');
  assert.equal(kevin.photo, '');
});
