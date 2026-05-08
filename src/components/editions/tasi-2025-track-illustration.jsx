const illustrationShell =
  'border-transparent bg-[linear-gradient(135deg,rgba(53,2,101,0.92),rgba(92,15,79,0.88),rgba(255,105,0,0.78))] shadow-lg shadow-[#5c0f4f]/20 dark:shadow-[#15002b]/40';
const illustrationTone =
  'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),rgba(255,255,255,0.12)_36%,rgba(17,24,39,0)_100%)]';
const strokeTone = 'border-white/60';
const glowTone = 'bg-white/25';
const accentFill =
  'bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,217,25,0.3),rgba(255,105,0,0.28))]';

const patterns = {
  orbit: (
    <>
      <div className={`absolute inset-6 rounded-full border ${strokeTone}`} />
      <div
        className={`absolute inset-x-10 top-3 h-12 rounded-full border ${strokeTone}`}
      />
      <div
        className={`absolute inset-y-4 right-10 w-12 rounded-full border ${strokeTone}`}
      />
      <div
        className={`absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${glowTone}`}
      />
      <div
        className={`absolute right-10 top-7 h-3 w-3 rounded-full ${glowTone}`}
      />
    </>
  ),
  shield: (
    <>
      <div
        className={`absolute left-1/2 top-5 h-16 w-16 -translate-x-1/2 rounded-[10px] border ${strokeTone} ${accentFill}`}
      />
      <div
        className={`absolute left-1/2 top-10 h-9 w-9 -translate-x-1/2 rotate-45 rounded-[10px] border ${strokeTone}`}
      />
      <div
        className={`absolute left-1/2 top-[4.7rem] h-3 w-10 -translate-x-1/2 rounded-full ${glowTone}`}
      />
    </>
  ),
  signal: (
    <>
      <div
        className={`absolute left-8 top-8 h-12 w-12 rounded-full border ${strokeTone}`}
      />
      <div
        className={`absolute left-14 top-14 h-12 w-12 rounded-full border ${strokeTone}`}
      />
      <div
        className={`absolute left-20 top-20 h-12 w-12 rounded-full border ${strokeTone}`}
      />
      <div
        className={`absolute right-10 top-10 h-4 w-4 rounded-full ${glowTone}`}
      />
      <div
        className={`absolute right-16 bottom-8 h-10 w-24 rounded-full ${accentFill}`}
      />
    </>
  ),
  support: (
    <>
      <div
        className={`absolute left-7 top-8 h-12 w-12 rounded-full ${accentFill}`}
      />
      <div
        className={`absolute right-8 top-8 h-12 w-12 rounded-full ${accentFill}`}
      />
      <div
        className={`absolute left-12 top-16 h-14 w-16 rotate-[-12deg] rounded-[10px] border ${strokeTone}`}
      />
      <div
        className={`absolute right-12 top-16 h-14 w-16 rotate-[12deg] rounded-[10px] border ${strokeTone}`}
      />
      <div
        className={`absolute left-1/2 top-[4.6rem] h-3 w-20 -translate-x-1/2 rounded-full ${glowTone}`}
      />
    </>
  ),
  foundation: (
    <>
      <div
        className={`absolute left-10 top-7 h-14 w-14 rounded-[10px] border ${strokeTone}`}
      />
      <div
        className={`absolute left-[5.4rem] top-12 h-14 w-14 rounded-[10px] border ${strokeTone}`}
      />
      <div
        className={`absolute right-10 top-7 h-14 w-14 rounded-[10px] border ${strokeTone}`}
      />
      <div
        className={`absolute left-1/2 bottom-7 h-3 w-28 -translate-x-1/2 rounded-full ${glowTone}`}
      />
    </>
  ),
  network: (
    <>
      <div
        className={`absolute left-10 top-9 h-4 w-4 rounded-full ${glowTone}`}
      />
      <div
        className={`absolute left-1/2 top-5 h-5 w-5 -translate-x-1/2 rounded-full ${glowTone}`}
      />
      <div
        className={`absolute right-10 top-10 h-4 w-4 rounded-full ${glowTone}`}
      />
      <div
        className={`absolute left-[4.4rem] bottom-8 h-4 w-4 rounded-full ${glowTone}`}
      />
      <div
        className={`absolute right-[4.4rem] bottom-8 h-4 w-4 rounded-full ${glowTone}`}
      />
      <div
        className={`absolute left-[4.9rem] top-11 h-px w-24 rotate-[14deg] ${accentFill}`}
      />
      <div
        className={`absolute left-1/2 top-8 h-16 w-px -translate-x-1/2 ${accentFill}`}
      />
      <div
        className={`absolute right-[4.9rem] top-11 h-px w-24 -rotate-[14deg] ${accentFill}`}
      />
      <div
        className={`absolute left-[5.2rem] bottom-10 h-px w-24 ${accentFill}`}
      />
    </>
  ),
};

export default function Tasi2025TrackIllustration({ variant }) {
  return (
    <div className={`mb-6 rounded-[10px] border p-4 ${illustrationShell}`}>
      <div
        className={`cardIllustration relative h-28 overflow-hidden rounded-[10px] ${illustrationTone}`}
      >
        <div className="absolute inset-0 opacity-90">{patterns[variant]}</div>
        <div className="absolute inset-x-6 bottom-4 h-px bg-white/30" />
      </div>
    </div>
  );
}
