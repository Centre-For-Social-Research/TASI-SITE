import { Building2, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  getAttendeeBucket,
  getAttendeeCategoryLabel,
  getAttendeeInitials,
  getBucketClasses,
} from '@/lib/attendees';

export default function AttendeeCard({ attendee, onViewProfile }) {
  const bucket = getAttendeeBucket(attendee.category, attendee.events ?? []);

  return (
    <Card className="h-full rounded-[10px] border-stone-200/80 bg-white/90 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950/85">
      <CardHeader className="gap-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <Avatar className="h-11 w-11 border border-stone-200 bg-[linear-gradient(135deg,#fff2ce_0%,#f6d6ff_100%)] dark:border-slate-700 dark:bg-[linear-gradient(135deg,#311338_0%,#18243d_100%)]">
            <AvatarFallback className="bg-transparent text-sm font-black text-stone-900 dark:text-white">
              {getAttendeeInitials(attendee.name)}
            </AvatarFallback>
          </Avatar>
          <Badge
            variant="outline"
            className={cn(
              'rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]',
              getBucketClasses(bucket)
            )}
          >
            {bucket}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <CardTitle className="line-clamp-2 text-lg font-black leading-tight text-stone-950 dark:text-white">
            {attendee.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-xs leading-5 text-stone-600 dark:text-slate-300">
            {getAttendeeCategoryLabel(attendee.category)}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col gap-4 px-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-stone-400 dark:text-slate-500" />
            <div className="min-w-0">
              <div className="line-clamp-2 text-sm font-semibold text-stone-900 dark:text-white">
                {attendee.organisation || 'Organisation not listed'}
              </div>
              <div className="line-clamp-2 text-xs text-stone-500 dark:text-slate-400">
                {attendee.designation || 'Designation not listed'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(attendee.events ?? []).slice(0, 3).map((eventName) => (
              <Badge
                key={eventName}
                variant="secondary"
                className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {eventName}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-auto flex gap-2 pt-2">
          <Button
            variant="default"
            className="h-9 flex-1 rounded-full bg-rc-primary px-3 text-[11px] font-black uppercase tracking-[0.12em] text-white hover:bg-rc-primary/90 dark:bg-amber-300 dark:text-stone-900"
            onClick={() => onViewProfile(attendee)}
          >
            <UserRound className="mr-1.5 h-3.5 w-3.5" />
            View profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
