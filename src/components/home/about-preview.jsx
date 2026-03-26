import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "./motion-reveal";
import CountUpNumber from "../ui/count-up-number";

const stats = [
  { value: 500, suffix: "+", label: "Participants (2025)" },
  { value: 100, suffix: "+", label: "Expert Speakers" },
  { value: 15, label: "Countries Represented" },
  { value: 32, label: "Partner Organisations" },
  { value: 30, suffix: "+", label: "Sessions Held" },
  { value: 10, suffix: "+", label: "Workshop Sessions" },
];

export default function AboutPreview() {
  return (
    <section className="bg-[#f0f0f0] pt-32 pb-20 md:pt-40 md:pb-28 dark:bg-[#1e1f26]">
      <div className="mx-auto grid w-full max-w-[1400px] gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:px-12">
        <MotionReveal>
          <div className="flex flex-col h-full justify-center">
            <h2 className="mb-6 text-5xl font-black uppercase tracking-tight text-[#171717] dark:text-white md:text-6xl lg:text-[4rem]" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>
              INDIA&apos;S FOREMOST
              <span className="mt-2 block text-[#350265] dark:text-white">TRUST & SAFETY</span>
              CONVENING.
            </h2>
            <div className="w-24 h-2 bg-[#ff6900] mb-8"></div>
            <p className="mb-6 text-xl font-medium leading-relaxed text-[#333333] dark:text-gray-300">
              TASI creates a rare collaborative space for dialogue between government, industry, academia, and civil society with practical focus on safety outcomes.
            </p>
            <p className="mb-10 text-xl font-medium leading-relaxed text-[#333333] dark:text-gray-300">
              Convened by Centre for Social Research and Trust and Safety Festival, the event helps shape global conversations on digital governance, ethics, and AI safety.
            </p>
            <div>
              <Link href="/about" className="inline-flex items-center justify-center rounded-full bg-[#171717] px-8 py-4 text-lg font-black uppercase tracking-widest text-white transition-all hover:bg-[#350265] hover:scale-105 dark:bg-white dark:text-[#171717] dark:hover:bg-[#ffd919]">
                Read Full Vision
              </Link>
            </div>
          </div>
        </MotionReveal>

        <MotionStagger className="grid grid-cols-2 gap-4 sm:gap-6">
          {stats.map((item) => (
            <MotionItem key={item.label}>
              <article className="group flex h-full min-h-[180px] flex-col items-center justify-center rounded-3xl bg-white p-6 md:p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:bg-[#24292d] dark:shadow-none">
                <CountUpNumber end={item.value} suffix={item.suffix || ""} className="text-5xl font-black text-[#ff6900] md:text-6xl" />
                <p className="mt-3 text-sm font-bold uppercase tracking-wider text-[#6a6a6a] dark:text-gray-400">{item.label}</p>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>


    </section>
  );
}
