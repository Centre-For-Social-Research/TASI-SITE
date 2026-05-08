'use client';

import { forwardRef, useState } from 'react';
import { Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';
import { cn } from '@/lib/utils';

const {
  VIP_LABEL,
  getSpeakerInitials,
  getSpeakerLinkedInUrl,
  getSpeakerPhotoSrc,
  isVipSpeaker,
} = speakerDirectoryUtils;

const SpeakerProfileCard = forwardRef(function SpeakerProfileCard(
  { speaker, className, ...props },
  ref
) {
  const [isFlipped, setIsFlipped] = useState(false);
  const avatarInitials = getSpeakerInitials(speaker.name);
  const linkedInUrl = getSpeakerLinkedInUrl(speaker);
  const photoSrc = getSpeakerPhotoSrc(speaker);
  const isFeaturedSpeaker = isVipSpeaker(speaker);

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
        <Card
          className={cn(
            'tasi-flip-face absolute h-full w-full rounded-[10px] p-6 shadow-lg',
            isFeaturedSpeaker
              ? 'border-[#9c3c46] bg-[#801b26]'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 text-center">
            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="rounded-full transition-opacity hover:opacity-90"
              aria-label={`View bio of ${speaker.name}`}
            >
              <Avatar
                className={cn(
                  'h-32 w-32 ring-4',
                  isFeaturedSpeaker ? 'ring-[#d4af37]' : 'ring-orange-500/10'
                )}
              >
                <AvatarImage
                  src={photoSrc}
                  alt={speaker.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {avatarInitials}
                </AvatarFallback>
              </Avatar>
            </button>

            <div className="space-y-2">
              <h3
                className={cn(
                  'text-xl font-bold',
                  isFeaturedSpeaker ? 'text-stone-50' : 'text-stone-900'
                )}
              >
                {speaker.name}
              </h3>
              <p
                className={cn(
                  'text-sm',
                  isFeaturedSpeaker ? 'text-stone-200' : 'text-stone-600'
                )}
              >
                {speaker.designation}
              </p>
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.1em]',
                  isFeaturedSpeaker ? 'text-amber-300' : 'text-orange-700'
                )}
              >
                {isFeaturedSpeaker ? VIP_LABEL : speaker.category}
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${speaker.name} LinkedIn`}
                  className={cn(
                    'rounded-full border p-1.5 transition-colors',
                    isFeaturedSpeaker
                      ? 'border-stone-300/60 text-stone-200 hover:border-stone-200 hover:text-stone-100'
                      : 'border-stone-300 text-stone-600 hover:border-orange-300 hover:text-orange-700'
                  )}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            <p
              className={cn(
                'mt-2 text-xs',
                isFeaturedSpeaker ? 'text-stone-300' : 'text-stone-500'
              )}
            >
              Click photo to view bio
            </p>
          </div>
        </Card>

        <Card
          className={cn(
            'tasi-flip-face tasi-flip-face-back absolute h-full w-full rounded-[10px] p-6 shadow-lg',
            isFeaturedSpeaker
              ? 'border-[#9c3c46] bg-[#801b26]'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3
                className={cn(
                  'text-xl font-bold',
                  isFeaturedSpeaker ? 'text-stone-50' : 'text-stone-900'
                )}
              >
                Bio
              </h3>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className={cn(
                  'text-sm transition-colors',
                  isFeaturedSpeaker
                    ? 'text-stone-300 hover:text-stone-100'
                    : 'text-stone-600 hover:text-stone-900'
                )}
              >
                Back
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  isFeaturedSpeaker ? 'text-stone-200' : 'text-stone-700'
                )}
              >
                {speaker.bio}
              </p>
            </div>

            <div
              className={cn(
                'mt-4 border-t pt-4',
                isFeaturedSpeaker ? 'border-[#9c3c46]' : 'border-stone-200'
              )}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  className={cn(
                    'h-10 w-10 ring-2',
                    isFeaturedSpeaker ? 'ring-[#d4af37]' : 'ring-transparent'
                  )}
                >
                  <AvatarImage
                    src={photoSrc}
                    alt={speaker.name}
                    className="object-cover"
                  />
                  <AvatarFallback>{avatarInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isFeaturedSpeaker ? 'text-stone-50' : 'text-stone-900'
                    )}
                  >
                    {speaker.name}
                  </p>
                  <p
                    className={cn(
                      'text-xs',
                      isFeaturedSpeaker ? 'text-stone-300' : 'text-stone-600'
                    )}
                  >
                    {isFeaturedSpeaker
                      ? `${VIP_LABEL} - ${speaker.designation}`
                      : speaker.designation}
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

SpeakerProfileCard.displayName = 'SpeakerProfileCard';

export default SpeakerProfileCard;
