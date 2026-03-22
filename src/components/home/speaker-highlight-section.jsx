import Image from "next/image";
import Link from "next/link";
import { speakers } from "@/data/speakers";

export default function SpeakerHighlightSection() {
  const highlights = [
    // 1. Govt (Minister)
    { name: "Dr. Subrahmanyam Jaishankar", file: "Dr. Subrahmanyam Jaishankar.png", searchName: "Dr. S Jaishankar", defaultRole: "Minister of External Affairs, Govt. of India" },
    // 2. Secretary
    { name: "S. Krishnan", file: "S. Krishnan.png", searchName: "S Krishnan", defaultRole: "Secretary, MeitY" },
    // 3. Additional Secretary
    { name: "Abhishek Singh", file: "Abhishek Singh.png" },
    // 4. Ambassadors / High Commissioner
    { name: "Jan Thesleff", file: "Jan Thesleff.png", defaultRole: "Ambassador of Sweden to India" },
    { name: "Marisa Gerards", file: "Marisa Gerards.png", defaultRole: "Ambassador of the Netherlands to India" },
    { name: "Thierry Mathou", file: "Thierry Mathou.png", defaultRole: "Ambassador of France to India" },
    { name: "Christopher Cooter", file: "Christopher Cooter.png", defaultRole: "High Commissioner of Canada" },
    // 5. Industry Partners / Civil Society
    { name: "Akash Pugalia", file: "Akash Pugalia.png" },
    { name: "Natasha Jog", file: "Natasha Jog.png" },
    { name: "Neda Niazian", file: "Neda Niazian.png" },
    { name: "Norman Ng", file: "Norman Ng.png" },
    { name: "Rajesh Ranjan", file: "Rajesh Ranjan.png" },
    { name: "Seema Jindal", file: "Seema Jindal.png" },
    { name: "Snigdha Bhardwaj", file: "Snigdha Bhardwaj.png" },
    { name: "Sunil Abraham", file: "Sunil Abraham.png" },
    { name: "Uthara Ganesh", file: "Uthara Ganesh.png" },
  ]; // Removed Yoel Roth just to have a perfect 16 grid for a exact 4x4 layout like the image. Actually if I want I can add him then it'll be 17. The image has exactly 16. So I'll keep 16.

  const mappedHighlights = highlights.map(highlight => {
    // Find speaker info
    const speakerData = speakers.find(s => s.name === highlight.name || (highlight.searchName && s.name === highlight.searchName));
    return {
      name: highlight.name,
      designation: speakerData ? speakerData.designation : (highlight.defaultRole || "Speaker"),
      image: `/img/Speaker Highlights/${highlight.file}`
    };
  });

  return (
    <section className="pt-1 pb-section-md md:pt-2 md:pb-section-lg bg-white dark:bg-[#121212]">
      <div className="container mx-auto max-w-[1300px] px-4 md:px-6 flex flex-col items-center">
        <p className="mb-2 uppercase tracking-widest text-stone-500 dark:text-stone-400 text-body-xs font-semibold">
          Key Voices
        </p>
        <h2 className="mb-5 text-center text-stone-900 dark:text-white text-display-lg font-black">
          Speakers from TASI 2025
        </h2>
        <p className="mx-auto mb-10 max-w-3xl text-center text-stone-700 dark:text-stone-300 text-body-md font-normal leading-relaxed">
          Hear directly from trust and safety leaders across policy, platforms, civil society, and international partnerships.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 w-full">
          {mappedHighlights.map((speaker, index) => (
            <div key={index} className="relative group aspect-[3/4] overflow-hidden bg-gray-200">
              <Image
                src={speaker.image}
                alt={speaker.name}
                fill
                className="object-cover grayscale transition-transform duration-500 group-hover:scale-105 group-hover:grayscale-0"
              />
              {/* Gradient overlay at the bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 flex flex-col justify-end">
                <h3 className="font-bold text-base md:text-lg leading-tight mb-1">{speaker.name}</h3>
                <p className="text-xs md:text-sm font-medium text-gray-200 leading-snug line-clamp-3">
                  {speaker.designation}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 w-full max-w-2xl px-4">
          <Link href="/speakers" className="flex items-center justify-center w-full py-4 border-2 border-rc-primary text-rc-primary rounded-full font-bold tracking-widest text-sm uppercase hover:bg-rc-primary hover:text-rc-primary-foreground transition-colors dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black">
            SEE MORE SPEAKERS
          </Link>
        </div>
      </div>
    </section>
  );
}
