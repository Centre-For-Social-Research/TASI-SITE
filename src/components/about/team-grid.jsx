import Image from "next/image";
import { teamMembers } from "@/data/team-members";

export default function TeamGrid() {
  return (
    <section className="py-14 md:py-16" id="team">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Team TASI</p>
        <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-stone-900 md:text-5xl">The Organizing Core</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teamMembers.map((member) => (
            <article key={member.name} className="flex h-[24rem] flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex justify-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-stone-300 bg-stone-100">
                  <Image
                    src={`/img/team/${member.photo}`}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              </div>
              <h3 className="mb-1 text-center text-lg font-bold text-stone-900">{member.name}</h3>
              <p className="mb-3 text-center text-sm text-stone-600">{member.designation}</p>
              <div className="flex-1 overflow-y-auto">
                <p className="text-center text-sm text-stone-700">{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
