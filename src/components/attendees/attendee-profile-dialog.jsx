import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  getAttendeeBucket,
  getAttendeeCategoryLabel,
  getAttendeeInitials,
  getBucketClasses,
} from '@/lib/attendees';

export default function AttendeeProfileDialog({ attendee, onClose }) {
  if (!attendee) {
    return null;
  }

  const bucket = getAttendeeBucket(attendee.category, attendee.events ?? []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Card className="rounded-[10px] border-stone-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="gap-5 border-b border-stone-200/80 dark:border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-stone-200 bg-[linear-gradient(135deg,#ffe7b8_0%,#e7c4ff_100%)] dark:border-slate-700 dark:bg-[linear-gradient(135deg,#362045_0%,#18283c_100%)]">
                  <AvatarFallback className="bg-transparent text-lg font-black text-stone-950 dark:text-white">
                    {getAttendeeInitials(attendee.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <CardTitle className="text-2xl font-black text-stone-950 dark:text-white">
                    {attendee.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]',
                        getBucketClasses(bucket)
                      )}
                    >
                      {bucket}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-bold text-stone-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {getAttendeeCategoryLabel(attendee.category)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={onClose}
                aria-label="Close attendee profile"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 py-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
            <div className="space-y-5">
              <ProfileField
                label="Organisation"
                value={attendee.organisation || 'Not listed'}
                valueClassName="text-base font-semibold text-stone-900 dark:text-white"
              />
              <ProfileField
                label="Designation"
                value={attendee.designation || 'Not listed'}
              />
              <ProfileField
                label="Notes"
                value={attendee.notes || 'No notes available'}
              />
            </div>

            <div className="space-y-5 rounded-[10px] border border-stone-200 bg-stone-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-slate-400">
                  Events
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(attendee.events ?? []).map((eventName) => (
                    <Badge
                      key={eventName}
                      variant="secondary"
                      className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-stone-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {eventName}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function ProfileField({ label, value, valueClassName }) {
  return (
    <div>
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
        {label}
      </div>
      <div
        className={cn(
          'mt-2 text-sm leading-6 text-stone-700 dark:text-slate-200',
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  );
}
