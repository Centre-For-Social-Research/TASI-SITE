// Which version of the homepage band to show, decided by the date alone so
// nothing needs deploying on the day. All times are IST.
//
//   countdown  until doors open at 09:00 on 14 Oct
//   live       14-15 Oct while the programme runs (Now and Next takes over)
//   thanks     after the last session on 15 Oct, until the end of 2026
//   none       from 2027, so a stale message never lingers

const liveProgramme = require('./live-programme.cjs');

const DOORS_OPEN_AT = Date.parse('2026-10-14T09:00:00+05:30');
const THANKS_UNTIL = Date.parse('2027-01-01T00:00:00+05:30');

const MINUTE = 60 * 1000;

function toTime(now) {
  return now instanceof Date ? now.getTime() : Number(now);
}

function getCountdown(now) {
  const remaining = Math.max(0, DOORS_OPEN_AT - toTime(now));
  const totalMinutes = Math.ceil(remaining / MINUTE);
  return {
    days: Math.floor(totalMinutes / (24 * 60)),
    hours: Math.floor((totalMinutes % (24 * 60)) / 60),
    minutes: totalMinutes % 60,
  };
}

function getFestivalPhase(sessions = [], now = new Date()) {
  const time = toTime(now);

  if (time < DOORS_OPEN_AT) {
    return { phase: 'countdown', countdown: getCountdown(time) };
  }
  if (time >= THANKS_UNTIL) return { phase: 'none' };

  const live = liveProgramme.getLiveProgramme(sessions, time);
  if (live.state === 'inactive' || live.state === 'ended') {
    return { phase: 'thanks' };
  }
  return { phase: 'live', live };
}

module.exports = {
  DOORS_OPEN_AT,
  THANKS_UNTIL,
  getCountdown,
  getFestivalPhase,
};
