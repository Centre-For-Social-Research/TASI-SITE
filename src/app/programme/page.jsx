import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import ProgrammeAgendaClient from "@/components/programme/programme-agenda-client";
import DarkHeroParticles from "@/components/ui/dark-hero-particles";
import { speakers } from "@/data/speakers";
import { agendaSpeakerFallbackTitles2025, programmeSessions2025 } from "@/data/programme-2025";

function normalizePersonName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/\b(dr|mr|mrs|ms|smt|shri|professor|prof|phd)\.?\b/g, " ")
    .replace(/^moderator:\s*/i, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSpeakerDesignationMap() {
  const fromSpeakersPage = Object.fromEntries(
    speakers.map((speaker) => [normalizePersonName(speaker.name), speaker.designation]).filter(([key, value]) => key && value),
  );

  return {
    ...agendaSpeakerFallbackTitles2025,
    ...fromSpeakersPage,
  };
}

const dayLabels = {
  oct6: "October 6 - Opening Reception",
  oct7: "October 7 - Conference Day 1",
  oct8: "October 8 - Conference Day 2",
};

const receptionNotes = [
  {
    day: "October 6",
    venue: "Embassy of France, New Delhi",
    description:
      "Opening evening reception for delegates and partners, with welcome remarks and spotlight conversations to launch TASI 2025.",
  },
  {
    day: "October 7",
    venue: "Embassy of Netherlands, New Delhi",
    description:
      "Networking reception and panel evening designed for cross-sector dialogue after the conference day at Taj Ambassador.",
  },
  {
    day: "October 8",
    venue: "Swedish Embassy, New Delhi",
    description:
      "Closing reception with reflections from the two-day agenda, a forward-looking panel, and informal networking over dinner.",
  },
];

function shouldShowSession(session) {
  const title = String(session?.title || "").trim().toLowerCase();
  return title !== "emcee" && title !== "registration + tea/coffee";
}

export default function ProgrammePage() {
  const speakerDesignationMap = buildSpeakerDesignationMap();
  const visibleSessions = programmeSessions2025.filter(shouldShowSession);

  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] dark:bg-stone-950">
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white py-14 dark:bg-[radial-gradient(circle_at_20%_0%,#1f2937_0%,#0b1220_45%,#05070e_100%)] md:py-20">
          <DarkHeroParticles />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-slate-300">Programme Overview</p>
            <h1 className="text-4xl font-black tracking-tight text-stone-900 dark:text-slate-100 md:text-6xl">
              TASI 2025 Agenda
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-stone-700 dark:text-slate-200">
              Explore sessions, speakers, and venue-wise programming across all festival days.
            </p>
          </div>
        </section>

        <ProgrammeAgendaClient
          sessions={visibleSessions}
          dayLabels={dayLabels}
          speakerDesignationMap={speakerDesignationMap}
          receptionNotes={receptionNotes}
        />
      </main>
      <HomeFooter />
    </>
  );
}
