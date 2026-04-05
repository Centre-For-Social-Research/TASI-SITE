'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Mail,
  MoveHorizontal,
  Twitter,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { teamMembers } from '@/data/team-members';

const ProfileCard = React.forwardRef(function ProfileCard(
  {
    name,
    designation,
    bio,
    imageUrl,
    linkedinUrl,
    email,
    twitterUrl,
    className,
    ...props
  },
  ref
) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      ref={ref}
      className={cn(
        'tasi-flip-perspective h-96 w-full max-w-[20rem]',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'tasi-flip-card relative h-full w-full cursor-pointer transition-transform duration-700',
          isFlipped ? 'tasi-flip-card-rotated' : 'tasi-flip-card-front'
        )}
      >
        <Card className="tasi-flip-face absolute h-full w-full rounded-[10px] border border-stone-200 bg-white p-6 text-stone-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-zinc-900 dark:text-white">
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 text-center">
            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="rounded-full transition-opacity hover:opacity-90"
              aria-label={`View bio of ${name}`}
            >
              <Avatar className="h-32 w-32 ring-4 ring-stone-200 dark:ring-white/25">
                <AvatarImage
                  src={imageUrl}
                  alt={name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl text-stone-900">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                {name}
              </h3>
              <p className="text-sm text-stone-600 dark:text-white/75">
                {designation}
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href={linkedinUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${name} LinkedIn`}
                  className="rounded-full border border-stone-300 bg-stone-100 p-1.5 text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-200 hover:text-stone-900 dark:border-white/20 dark:bg-white/10 dark:text-white/85 dark:hover:border-white dark:hover:bg-white/20 dark:hover:text-white"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${name} Twitter/X`}
                    className="rounded-full border border-stone-300 bg-stone-100 p-1.5 text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-200 hover:text-stone-900 dark:border-white/20 dark:bg-white/10 dark:text-white/85 dark:hover:border-white dark:hover:bg-white/20 dark:hover:text-white"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                <a
                  href={`mailto:${email || 'info1@csrindia.org'}`}
                  aria-label={`Email ${name}`}
                  className="rounded-full border border-stone-300 bg-stone-100 p-1.5 text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-200 hover:text-stone-900 dark:border-white/20 dark:bg-white/10 dark:text-white/85 dark:hover:border-white dark:hover:bg-white/20 dark:hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
            <p className="mt-2 text-xs text-stone-500 dark:text-white/65">
              Click photo to view bio
            </p>
          </div>
        </Card>

        <Card className="tasi-flip-face tasi-flip-face-back absolute h-full w-full rounded-[10px] border border-stone-200 bg-white p-6 text-stone-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-zinc-900 dark:text-white">
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                Bio
              </h3>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-white/70 dark:hover:text-white"
              >
                Back
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <p className="text-sm leading-relaxed text-stone-700 dark:text-white/85">
                {bio}
              </p>
            </div>
            <div className="mt-4 border-t border-stone-200 pt-4 dark:border-white/15">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={imageUrl}
                    alt={name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-stone-900">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-stone-900 dark:text-white">
                    {name}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-white/70">
                    {designation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

ProfileCard.displayName = 'ProfileCard';

export default function TeamGrid() {
  const carouselRef = React.useRef(null);

  const scrollByCards = React.useCallback((direction = 1) => {
    if (!carouselRef.current) return;
    
    const track = carouselRef.current;
    
    const card = track.querySelector('[data-team-card]');
    // Scroll intentionally slightly more than one card to ensure snap target updates
    const step = card ? card.offsetWidth + 24 : track.clientWidth * 0.5;

    track.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    });
  }, []);

  const handlePrev = React.useCallback(() => {
    scrollByCards(-1);
  }, [scrollByCards]);

  const handleNext = React.useCallback(() => {
    scrollByCards(1);
  }, [scrollByCards]);

  return (
    <section
      className="bg-white py-section-md dark:bg-[#121212] md:py-section-lg"
      id="team"
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-body-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Organizing Team
            </p>
            <h2 className="text-display-sm font-black tracking-tight text-stone-900 dark:text-white md:text-display-lg">
              The People Building TASI
            </h2>
            <p className="mt-4 max-w-2xl text-body-md leading-relaxed text-stone-700 dark:text-white/70">
              A cross-sector team advancing research, convening, digital safety
              practice, and partnership-building across the festival.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-white/60">
              <MoveHorizontal className="h-4 w-4" />
              Scroll or drag to explore the full organizing team.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous team member"
              onClick={handlePrev}
              className="tasi-team-prev rounded-full border border-stone-300 bg-white p-3 text-stone-700 shadow-sm transition hover:border-stone-400 hover:text-stone-900 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/30 dark:hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next team member"
              onClick={handleNext}
              className="tasi-team-next rounded-full border border-stone-300 bg-white p-3 text-stone-700 shadow-sm transition hover:border-stone-400 hover:text-stone-900 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/30 dark:hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto px-1 pb-2 overscroll-x-contain [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        >
          {teamMembers.map((member) => (
            <div
              key={member.name}
              data-team-card
              className="min-w-0 shrink-0 basis-[88%] sm:basis-[70%] lg:basis-[calc((100%-3rem)/4)]"
            >
              <ProfileCard
                name={member.name}
                designation={member.designation}
                bio={member.bio}
                imageUrl={`/img/team/${member.photo}`}
                linkedinUrl={member.linkedinUrl}
                email={member.email}
                twitterUrl={member.twitterUrl}
                className="max-w-[20rem]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
