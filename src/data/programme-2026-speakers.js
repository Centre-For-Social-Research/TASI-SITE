// Confirmed speakers for TASI 2026 sessions, keyed by programme session id.
//
// Add a session's speakers here once they are confirmed, e.g.
//   'tasi26-25': ['Yoel Roth', 'Kevin Lee'],
//
// Names must match the `name` in src/data/speakers-2026.json exactly; that is
// where the photo, designation and profile link come from. A CI test fails on
// any unknown name or session id, so typos never reach the live site.
// Sessions not listed here show no speakers.

export const sessionSpeakers2026 = {};
