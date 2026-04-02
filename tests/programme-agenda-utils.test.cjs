const test = require('node:test');
const assert = require('node:assert/strict');

const {
  sortProgrammeSessionsForAgenda,
} = require('../src/lib/programme-agenda-utils.cjs');

test('sortProgrammeSessionsForAgenda returns sessions in agenda day and time order', () => {
  const sorted = sortProgrammeSessionsForAgenda([
    {
      id: 'dome-late',
      day: 'oct7',
      time: '10:20',
      venue: 'Dome',
      title: 'Keynote Speech',
    },
    {
      id: 'oct6-opening',
      day: 'oct6',
      time: '17:00',
      venue: 'Dome',
      title: 'Opening remarks',
    },
    {
      id: 'tango-early',
      day: 'oct7',
      time: '9:00',
      venue: 'Tango',
      title: 'Child Safety',
    },
    {
      id: 'dome-early',
      day: 'oct7',
      time: '9:00',
      venue: 'Dome',
      title: 'Welcome remarks',
    },
    {
      id: 'oct6-tbd',
      day: 'oct6',
      time: 'TBD',
      venue: 'Dome',
      title: 'Spotlight',
    },
  ]);

  assert.deepEqual(
    sorted.map((session) => session.id),
    ['oct6-tbd', 'oct6-opening', 'tango-early', 'dome-early', 'dome-late']
  );
});

test('sortProgrammeSessionsForAgenda does not mutate the original sessions array', () => {
  const sessions = [
    { id: 'later', day: 'oct8', time: '15:15', venue: 'Dome' },
    { id: 'earlier', day: 'oct8', time: '9:15', venue: 'Dome' },
  ];

  const result = sortProgrammeSessionsForAgenda(sessions);

  assert.notEqual(result, sessions);
  assert.deepEqual(
    sessions.map((session) => session.id),
    ['later', 'earlier']
  );
});
