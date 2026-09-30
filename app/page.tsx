"use client";

import { Anton, Playfair_Display, Space_Mono } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

import { AmbientSignalField } from "@/components/home/ambient-signal-field";
import { cn } from "@/lib/utils";

const anton = Anton({ subsets: ["latin"], weight: "400" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const workshopItems = [
  {
    title: "Archive / 01",
    type: "Editorial system",
    image: "/bg.png",
    tone: "red",
  },
  {
    title: "Archive / 02",
    type: "Field documentation",
    image: "/bg.png",
    tone: "yellow",
  },
  {
    title: "Archive / 03",
    type: "Community toolkit",
    image: "/bg.png",
    tone: "blue",
  },
  {
    title: "Archive / 04",
    type: "Audio dispatch",
    image: "/bg.png",
    tone: "violet",
  },
];

const projects = [
  { title: "Project / A", label: "Humanitarian response", accent: "#ff3b30" },
  { title: "Project / B", label: "Civic learning lab", accent: "#ffd23f" },
  { title: "Project / C", label: "Mutual aid network", accent: "#3fb8ff" },
];

function MagneticLink({
  children,
  onClick,
  secondary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  secondary?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex items-center justify-center gap-3 rounded-full px-6 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.25em] transition-colors",
        secondary
          ? "border border-[#f3efe4]/25 text-[#f3efe4] hover:border-[#ff3b30] hover:text-[#ff3b30]"
          : "bg-[#f3efe4] text-[#0a0a08] hover:bg-[#ff3b30]",
      )}
    >
      {children}
    </motion.button>
  );
}

export default function Home() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".hero-kicker, .hero-copy, .hero-actions",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" },
      );
      gsap.fromTo(
        ".hero-title-line",
        { yPercent: 110 },
        { yPercent: 0, duration: 1.1, stagger: 0.1, ease: "power4.out" },
      );
      gsap.to(".hero-rule", {
        scaleX: 1,
        duration: 1.2,
        delay: 0.45,
        ease: "power3.inOut",
      });
    }, pageRef);
    return () => context.revert();
  }, []);

  return (
    <main
      ref={pageRef}
      className={cn(
        mono.className,
        "min-h-screen overflow-x-clip bg-[#0a0a08] text-[#f3efe4]",
      )}
    >
      <section
        ref={heroRef}
        className="relative isolate min-h-[88svh] overflow-hidden border-b border-[#f3efe4]/10 px-6 pb-16 pt-32 sm:px-10 lg:px-16"
      >
           <Image
             src="/bg.png"
             alt=""
             fill
             priority
             sizes="100vw"
             className="pointer-events-none -z-20 object-cover opacity-15 grayscale"
           />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_35%,rgba(255,59,48,0.18),transparent_36%),linear-gradient(180deg,rgba(10,10,8,0.22),#0a0a08_88%)]" />
        <AmbientSignalField />
        <div className="relative z-10 mx-auto flex min-h-[70svh] w-full max-w-7xl flex-col justify-between">
          <div className="hero-kicker flex items-center justify-between gap-4 font-mono text-[0.6rem] uppercase tracking-[0.35em] text-[#f3efe4]/55">
            
            <span>Lorem ipsum dolor sit amet</span>
          </div>
          <div className="max-w-6xl">
            <div className="overflow-hidden">
              <h1
                className={cn(
                  anton.className,
                  "hero-title-line text-[clamp(4rem,15vw,13rem)] uppercase leading-[0.78] tracking-[-0.04em]",
                )}
              >
                Gen
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1
                className={cn(
                  anton.className,
                  "hero-title-line text-[clamp(4rem,15vw,13rem)] uppercase leading-[0.78] tracking-[-0.04em] text-transparent",
                )}
                style={{ WebkitTextStroke: "2px #f3efe4" }}
              >
                Uprising
              </h1>
            </div>
            <div className="hero-rule mt-8 h-px w-full origin-left scale-x-0 bg-[#ff3b30]" />
            <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <p
                className={cn(
                  playfair.className,
                  "hero-copy max-w-xl text-xl italic leading-relaxed text-[#f3efe4]/70 sm:text-2xl",
                )}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                vitae lectus sed neque consequat porta.
              </p>
              <div className="hero-actions flex flex-col gap-3 sm:flex-row">
                <MagneticLink onClick={() => router.push("/case-files")}>
                  Read the Case Files <ArrowRight size={14} />
                </MagneticLink>
                <MagneticLink
                  secondary
                  onClick={() => router.push("/sponsors")}
                >
                  Back the Movement <ArrowUpRight size={14} />
                </MagneticLink>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between gap-4 font-mono text-[0.58rem] uppercase tracking-[0.3em] text-[#f3efe4]/40">
            <span>Scroll to inspect</span>
            <span>01 — 03</span>
          </div>
        </div>
      </section>

      <section className="border-b border-[#f3efe4]/10 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 border-b border-[#f3efe4]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.35em] text-[#ff3b30]">
                02 / Workshop
              </p>
              <h2
                className={cn(
                  anton.className,
                  "text-5xl uppercase leading-none sm:text-7xl",
                )}
              >
                Done work
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#f3efe4]/55">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {workshopItems.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.65, delay: index * 0.08 }}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden border border-[#f3efe4]/12 bg-[#12110d]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a08] via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 font-mono text-[0.58rem] uppercase tracking-[0.3em] text-[#f3efe4]/70">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center justify-between p-5">
                  <h3 className={cn(anton.className, "text-2xl uppercase")}>
                    {item.title}
                  </h3>
                  <ExternalLink size={16} className="text-[#ff3b30]" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-[#f3efe4]/10 bg-[#f3efe4] px-6 py-24 text-[#0a0a08] sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 border-b border-[#0a0a08]/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.35em] text-[#ff3b30]">
                03 / Projects
              </p>
              <h2
                className={cn(
                  anton.className,
                  "text-5xl uppercase leading-none sm:text-7xl",
                )}
              >
                In motion
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#0a0a08]/60">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim
              ad minim veniam, quis nostrud.
            </p>
          </div>
          <div className="divide-y divide-[#0a0a08]/15 border-y border-[#0a0a08]/15">
            {projects.map((project, index) => (
              <motion.button
                key={project.title}
                type="button"
                onClick={() => router.push("/sponsors")}
                whileHover={{ x: 12 }}
                className="group flex w-full items-center gap-5 py-7 text-left"
              >
                <span className="font-mono text-xs text-[#0a0a08]/45">
                  0{index + 1}
                </span>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: project.accent }}
                />
                <span
                  className={cn(
                    anton.className,
                    "flex-1 text-3xl uppercase sm:text-5xl",
                  )}
                >
                  {project.title}
                </span>
                <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.25em] text-[#0a0a08]/55 sm:block">
                  {project.label}
                </span>
                <ArrowUpRight
                  size={21}
                  className="transition-transform group-hover:rotate-45"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-28 text-center sm:px-10 lg:px-16">
        <p className="mb-5 font-mono text-[0.62rem] uppercase tracking-[0.35em] text-[#ff3b30]">
          The desk is open
        </p>
        <h2
          className={cn(
            anton.className,
            "mx-auto max-w-4xl text-6xl uppercase leading-[0.86] sm:text-8xl",
          )}
        >
          Make noise that moves.
        </h2>
        <p
          className={cn(
            playfair.className,
            "mx-auto mt-7 max-w-lg text-lg italic text-[#f3efe4]/60",
          )}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
          commodo ligula eget dolor.
        </p>
        <div className="mt-9 flex justify-center">
          <MagneticLink onClick={() => router.push("/signals")}>
            Read Signals <ArrowRight size={14} />
          </MagneticLink>
        </div>
      </section>
    </main>
  );
}
