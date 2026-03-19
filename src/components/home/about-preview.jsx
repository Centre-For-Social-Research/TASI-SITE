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
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-2 md:px-6">
        <MotionReveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">About TASI 2026</p>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">
            India&apos;s Foremost
            <span className="block text-orange-700">Trust and Safety Convening</span>
          </h2>
          <p className="mb-4 text-stone-700">
            TASI creates a rare collaborative space for dialogue between government, industry, academia, and civil society with practical focus on safety outcomes.
          </p>
          <p className="mb-6 text-stone-700">
            Convened by Centre for Social Research and Trust and Safety Festival, the event helps shape global conversations on digital governance, ethics, and AI safety.
          </p>
          <Link href="/about" className="font-semibold text-orange-700 hover:text-orange-800">
            Read Full Vision
          </Link>
        </MotionReveal>

        <MotionStagger className="grid grid-cols-2 gap-3">
          {stats.map((item) => (
            <MotionItem key={item.label}>
              <article className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <CountUpNumber end={item.value} suffix={item.suffix || ""} className="text-2xl font-black text-stone-900" />
                <p className="text-sm text-stone-600">{item.label}</p>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>


    </section>
  );
}
