import { QrCode } from 'lucide-react';

// A stylised stand-in for the QR pass email so attendees know what they are
// looking for. Deliberately generic: no name, no real QR code.
export default function PassIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[22rem] -rotate-3 transition-transform duration-500 hover:rotate-0"
    >
      <div className="flex overflow-hidden rounded-[10px] bg-white text-[#1a1230] shadow-[0_24px_60px_rgba(10,4,30,0.45)]">
        <div className="flex w-14 flex-none items-center justify-center bg-[#350265]">
          <span className="-rotate-90 whitespace-nowrap text-[11px] font-black uppercase tracking-[0.3em] text-[#ffd919]">
            TASI 2026
          </span>
        </div>

        <div className="flex-1 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c2185b]">
            QR entry pass
          </p>
          <div className="mt-3 space-y-2">
            <span className="block h-3 w-36 rounded-full bg-stone-200" />
            <span className="block h-2.5 w-24 rounded-full bg-stone-100" />
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div className="text-[11px] leading-snug text-stone-500">
              <p className="font-bold text-[#1a1230]">14–15 October 2026</p>
              <p>India International Centre</p>
              <p>New Delhi</p>
            </div>
            <div className="rounded-[10px] border-2 border-[#1a1230] p-1.5">
              <QrCode className="h-14 w-14" strokeWidth={1.6} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
