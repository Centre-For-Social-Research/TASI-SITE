import TravelShell from "@/components/travel/travel-shell";
import Image from "next/image";
import { MapPin, ExternalLink, Hotel } from "lucide-react";

export const metadata = {
  title: "Accommodation – Plan Your Travel · TASI 2026",
  description:
    "Curated selection of 26 premier hotels near the TASI 2026 summit venue in New Delhi. Book independently to secure your stay.",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const CDN = "https://d19ob9sqegt2wc.cloudfront.net/stage/uploads/";

const hotels = [
  { name: "Aloft New Delhi Aerocity",       area: "Aerocity",                         url: "https://www.marriott.com/en-us/hotels/delal-aloft-new-delhi-aerocity",       photo: CDN + "aloft_new_delhi_aerocity_a20a7d5465.webp" },
  { name: "Andaz Delhi",                    area: "Aerocity",                         url: "https://www.hyatt.com/en-US/hotel/india/andaz-delhi/delad",                  photo: CDN + "36c3883f137ec47f735fbe262bce57e3e99ede69_8a97ab0316.png" },
  { name: "Claridges",                      area: "Motilal Nehru Marg, New Delhi",    url: "https://www.claridges.com",                                                  photo: CDN + "b0b46f07926b8c7bff4b3c4393f3ee2acd398203_5e9eb189c7.png" },
  { name: "Eros Hotel",                     area: "Nehru Place",                      url: "https://www.eroshotel.co.in",                                                photo: CDN + "bde33ea88da2533ef9aa14381c6a2404eba76883_0771d41aab.jpg" },
  { name: "Hotel Grand",                    area: "Vasant Kunj",                      url: "http://www.thegrandnewdelhi.com",                                            photo: CDN + "65e593ea8241c12faabb30a4ee51160d6547ac79_a315a42d39.png" },
  { name: "Hyatt Regency Delhi",            area: "Bhikaji Cama Place",               url: "https://www.hyatt.com/en-US/hotel/india/hyatt-regency-delhi/delhr",          photo: "/img/travel/hotels/hyatt-delhi.webp" },
  { name: "Imperial Hotel",                 area: "Janpath Lane, Connaught Place",    url: "https://theimperialindia.com",                                               photo: CDN + "c3db91e9a6853e6b4a12c9bd3c37a6279deb2b3b_8e00498d98.png" },
  { name: "India Habitat Centre",           area: "6, Lodhi Road, New Delhi",         url: "http://www.indiahabitat.org",                                                photo: CDN + "f10301c4dea4f1d71da5c003fec9aec82ec2e9e8_ed18e88de5.png" },
  { name: "ITC Maurya",                     area: "S.P. Marg, Diplomatic Enclave",    url: "https://www.itchotels.com/in/en/itcmaurya-newdelhi",                         photo: CDN + "89f5082989065e2f14df0ce680a86a9b2e3b3970_1_3198ff07e0.png" },
  { name: "JW Marriott",                    area: "Aerocity",                         url: "https://www.marriott.com/en-us/hotels/deljw-jw-marriott-hotel-new-delhi-aerocity", photo: CDN + "ee650db5efebdc9dce063b4f3a6fff4168a3052d_ebb2d08be0.jpg" },
  { name: "Le Méridien",                    area: "Windsor Place, Connaught Place",   url: "https://www.marriott.com/en-us/hotels/delmd-le-meridien-new-delhi",           photo: CDN + "2ecbade3be5bb23aeadbbeec8798f6fb4f3daf0f_c98b298c7d.png" },
  { name: "Pride Plaza",                    area: "Aerocity",                         url: "https://www.pridehotel.com",                                                 photo: CDN + "052020f5fb12707a7267bcc77a82ea46770ef729_5a28f6fd0d.png" },
  { name: "Pullman New Delhi Aerocity",     area: "Aerocity",                         url: "https://all.accor.com/hotel/7687/index.en.shtml",                            photo: CDN + "7b4d0eb3868a46fba399c4d680d23a3a49949ab7_fc106fc666.png" },
  { name: "Radisson Blu Plaza",             area: "NH 8, Mahipalpur",                 url: "https://www.radissonhotels.com/en-us/hotels/radisson-blu-new-delhi-paschim-vihar", photo: CDN + "ec3e9dab0d70a8bd88b6a2a097ed44a601d024da_c71258255a.png" },
  { name: "Roseate New Delhi",              area: "Aerocity",                         url: "https://www.roseatehotels.com/newdelhi/theroseate",                          photo: CDN + "967cbe5771fe5508d0b6827b9ff67d5ed6fbc773_02f4a13b07.png" },
  { name: "Shangri-La Eros",               area: "19 Ashoka Road, New Delhi",        url: "https://www.shangri-la.com/newdelhi/shangrila",                              photo: CDN + "ece5617d680f0ec59aee77150f9be5260f5a3522_d7158d74ce.png" },
  { name: "Sheraton New Delhi",             area: "Lodhi Road, New Delhi",            url: "https://www.marriott.com/en-us/hotels/delsi-sheraton-new-delhi-hotel",       photo: CDN + "caf4655c69cfa0bdf0813186e32c3c7d90af9d63_2363d951b5.jpg" },
  { name: "Taj Mahal Hotel",               area: "Mansingh Road, New Delhi",         url: "https://www.tajhotels.com/en-in/taj/taj-mahal-new-delhi",                    photo: CDN + "76919548eeeab6b30ef984cea5d89bc770798033_fede13204c.jpg" },
  { name: "Taj Palace",                     area: "Sardar Patel Marg",                url: "https://www.tajhotels.com/en-in/taj/taj-palace-new-delhi",                   photo: CDN + "2f91270d5f6cadd98f97726466230e4ce85ff5cd_05a577dfba.png" },
  { name: "The Ashok",                      area: "Niti Marg, Chanakyapuri",          url: "http://www.theashokhotel.com",                                               photo: CDN + "8756fd207bd5df1a93a369cdd1663b28a90e6f43_098ff6dbd6.png" },
  { name: "The Connaught",                  area: "Shaheed Bhagat Singh Marg",        url: "https://www.seleqtionshotels.com/en-in/the-connaught-new-delhi",             photo: CDN + "cb604771380c9cc0b986754cdc8ca72b09a1a0b6_86d00e249d.png" },
  { name: "The Lalit",                      area: "Barakhamba Avenue, Connaught Pl.", url: "https://www.thelalit.com/the-lalit-new-delhi",                               photo: CDN + "23f23931cb36be551c6e5a0c55ddd96964899142_97a30bae73.jpg" },
  { name: "The Leela",                      area: "Africa Avenue, Chanakyapuri",      url: "https://www.theleela.com/the-leela-new-delhi",                               photo: CDN + "2676dd7390d3f3c8b6fcd1a0d14deb043f63fac4_4ca653bb4e.png" },
  { name: "The Lodhi",                      area: "Lodhi Road, New Delhi",            url: "https://www.thelodhi.com",                                                   photo: CDN + "a6f5ef5674eb62631e7c7092888c5b66fe5144e8_a018a80ded.png" },
  { name: "The Oberoi, New Delhi",          area: "Dr. Zakir Hussain Marg",           url: "https://www.oberoihotels.com/hotels-in-new-delhi",                           photo: CDN + "7416c80b2d37cda299609f6e303f33a312ee4423_8481281b9b.png" },
  { name: "Vivanta by Taj",                 area: "Dwarka Sector 21",                 url: "https://www.vivantahotels.com/en-in/vivanta-new-delhi-dwarka",               photo: CDN + "847e2583f3d7fb14d3f1c3f3948231bf89cc5c79_27ed11bd8e.png" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccommodationPage() {
  return (
    <TravelShell>
      {/* Intro banner */}
      <section className="border-b border-stone-200 bg-stone-50 px-4 py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-5xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] bg-violet-100 dark:bg-violet-900/40">
              <Hotel className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="font-bold text-stone-900 dark:text-white">Recommended Hotels · New Delhi</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Accommodation is to be arranged and booked independently by delegates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800/60 dark:bg-amber-950/20">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">26</span>
            <span className="text-xs text-stone-600 dark:text-stone-400">hotels<br />listed</span>
          </div>
        </div>
      </section>

      {/* Hotel photo grid */}
      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Where to Stay
            </p>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Recommended Hotels
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <a
                key={hotel.name}
                href={hotel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-sm transition hover:shadow-md dark:border-stone-700 dark:bg-stone-900"
              >
                {/* Photo */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  {hotel.photo ? (
                    <Image
                      src={hotel.photo}
                      alt={hotel.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Hotel className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-stone-900 transition group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-400">
                        {hotel.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{hotel.area}</span>
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 text-stone-300 transition group-hover:text-violet-500 dark:text-stone-600" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="mt-10 text-center text-xs text-stone-400 dark:text-stone-500">
            Hotel listings are provided for convenience. Rates, availability, and booking terms are subject to each property's policies.
            TASI has no affiliation with any of the hotels listed.
          </p>
        </div>
      </section>
    </TravelShell>
  );
}
