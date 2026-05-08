import { attendees } from '@/data/attendees';
import {
  hiddenPublicAttendeeIds,
  publicAttendeeOverrides,
} from '@/data/attendees-page';

const hiddenPublicAttendees = new Set(hiddenPublicAttendeeIds);

export const publicAttendees = attendees
  .filter((attendee) => !hiddenPublicAttendees.has(attendee.id))
  .map((attendee) => {
    const curatedAttendee = {
      ...attendee,
      ...(publicAttendeeOverrides[attendee.id] ?? {}),
    };
    const { email, phone, ...publicFields } = curatedAttendee;

    return publicFields;
  })
  .filter((attendee) => attendee.organisation || attendee.designation);
