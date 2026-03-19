"use client";

import React from "react";
import { Linkedin, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { teamMembers } from "@/data/team-members";

const ProfileCard = React.forwardRef(function ProfileCard(
  { name, designation, bio, imageUrl, linkedinUrl, email, className, ...props },
  ref
) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      ref={ref}
      className={cn("h-96 w-full max-w-[20rem]", className)}
      style={{ perspective: "1000px" }}
      {...props}
    >
      <div
        className="relative h-full w-full cursor-pointer transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <Card
          className="absolute h-full w-full border-stone-200 bg-white p-6 shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 text-center">
            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="rounded-full transition-opacity hover:opacity-90"
              aria-label={`View bio of ${name}`}
            >
              <Avatar className="h-32 w-32 ring-4 ring-orange-500/10">
                <AvatarImage src={imageUrl} alt={name} className="object-cover" />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
            </button>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stone-900">{name}</h3>
              <p className="text-sm text-stone-600">{designation}</p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href={linkedinUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${name} LinkedIn`}
                  className="rounded-full border border-stone-300 p-1.5 text-stone-600 transition-colors hover:border-orange-300 hover:text-orange-700"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${email || "info1@csrindia.org"}`}
                  aria-label={`Email ${name}`}
                  className="rounded-full border border-stone-300 p-1.5 text-stone-600 transition-colors hover:border-orange-300 hover:text-orange-700"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
            <p className="mt-2 text-xs text-stone-500">Click photo to view bio</p>
          </div>
        </Card>

        <Card
          className="absolute h-full w-full border-stone-200 bg-white p-6 shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-900">Bio</h3>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="text-sm text-stone-600 transition-colors hover:text-stone-900"
              >
                Back
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <p className="text-sm leading-relaxed text-stone-700">{bio}</p>
            </div>
            <div className="mt-4 border-t border-stone-200 pt-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={imageUrl} alt={name} className="object-cover" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-stone-900">{name}</p>
                  <p className="text-xs text-stone-600">{designation}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

ProfileCard.displayName = "ProfileCard";

export default function TeamGrid() {
  return (
    <section className="py-14 md:py-16" id="team">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Team TASI</p>
        <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-stone-900 md:text-5xl">The Organizing Core</h2>

        <div className="grid justify-items-center gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {teamMembers.map((member) => (
            <ProfileCard
              key={member.name}
              name={member.name}
              designation={member.designation}
              bio={member.bio}
              imageUrl={`/img/team/${member.photo}`}
              linkedinUrl={member.linkedinUrl}
              email={member.email}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
