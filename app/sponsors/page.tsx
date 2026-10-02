"use client";

import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Anton, Playfair_Display, Space_Mono } from "next/font/google";

const anton = Anton({ subsets: ["latin"], weight: "400" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const sponsors = [
  {
    name: "Subhas Seth",
    description: "Our director's father, a superb dentist and overall a master at his field",
  },
  {
    name: "Sambit Seth",
    description: "Our very efficient and productive director with a knack for multitasking",
  },
  {
    name: "Awtar Vishwakarma",
    description: "Excellent PR member, even better sense of humor",
  },
  {
    name: "Subham Gupta",
    description: "No longer with us sadly, but his support for a noble cause is appreciated and felt",
  },
  {
    name: "Priyasha Chakraborty",
    description: "Our treasured treasurer with amazing inputs each time",
  },
  {
    name: "Sanvi Dutta",
    description: "Our head of public relations, also an avid chess player and classical music enthusiast",
  },
  {
    name: "Aryaka Sikdar",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "Yousif Khalil",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "Laasya Priya",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "Tosha Chakraborty",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

const floatingSquares = [
  "-top-20 left-[8%] h-36 w-36 rotate-[18deg] bg-white/80",
  "-top-28 right-12 h-40 w-40 rotate-[-12deg] bg-white",
  "bottom-10 left-[6%] h-16 w-16 rotate-[8deg] bg-[#ff3b30]/80",
  "bottom-[-18%] right-[4%] h-32 w-32 rotate-[16deg] bg-white/70",
  "top-1/2 left-[5%] h-20 w-20 rotate-[32deg] bg-[#ff3b30]/80",
  "bottom-[28%] right-[11%] h-24 w-24 rotate-[-18deg] bg-white",
];

const SponsorCard = ({
  sponsor,
  index,
}: {
  sponsor: (typeof sponsors)[number];
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease, delay: index * 0.06 }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease } }}
      className="h-full"
    >
      <div className="group relative h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#11110e]/90 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(280px circle at 25% 20%, rgba(255,59,48,0.22), transparent 72%)`,
          }}
        />

        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <span className="rounded-full border border-[#ff3b30]/50 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-[#ff3b30]">
              #{String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h2
            className={`${anton.className} text-[1.8rem] uppercase leading-[1.02] text-[#f3efe4]`}
          >
            {sponsor.name}
          </h2>

          {sponsor.description ? (
            <p
              className={`${playfair.className} mt-5 text-[0.96rem] italic leading-relaxed text-[#f3efe4]/70`}
            >
              {sponsor.description}
            </p>
          ) : null}

        </div>
      </div>
    </motion.div>
  );
};

export default function SponsorsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a08] text-[#f3efe4]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(0,0,0,0.92)_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.8),rgba(10,10,10,0.96))]" />

      {floatingSquares.map((classes) => (
        <div
          key={classes}
          aria-hidden
          className={`pointer-events-none absolute z-0 rounded-[18%] bg-blend-screen blur-[0.2px] ${classes}`}
        />
      ))}

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-28 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mx-auto mb-16 grid max-w-6xl items-end gap-10 text-left lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <p
              className={`${mono.className} mb-5 text-[0.68rem] uppercase tracking-[0.62em] text-[#ff3b30]`}
            >
              The support desk / 2026
            </p>
            <h1
              className={`${anton.className} text-[clamp(3.5rem,10vw,8rem)] uppercase leading-[0.82] tracking-[-0.04em] text-[#f3efe4]`}
            >
              <span className="block">Back the</span>
              <span
                className="block text-transparent"
                style={{ WebkitTextStroke: "1px #f3efe4" }}
              >
                noise
              </span>
            </h1>
          </div>
          <div className="border-l border-[#ff3b30]/60 pl-6 lg:mb-2">
            <p
              className={`${playfair.className} max-w-md text-xl italic leading-relaxed text-[#f3efe4]/80`}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sponsors.map((sponsor, index) => (
            <SponsorCard key={sponsor.name} sponsor={sponsor} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
