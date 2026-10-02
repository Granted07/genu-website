"use client";
import { motion, useReducedMotion } from "motion/react";
import { Anton, Playfair_Display, Space_Mono } from "next/font/google";

import { TeamCore } from "@/components/team/team-core";
import { cn } from "@/lib/utils";

const anton = Anton({ subsets: ["latin"], weight: "400" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const RED = "#ff3b30";

export type CSuiteMember = {
  id: number;
  name: string;
  position: string;
};

type TeamRosterProps = {
  members: CSuiteMember[];
  errorMessage?: string | null;
};

export default function TeamRoster({
  members,
  errorMessage = null,
}: TeamRosterProps) {
  const reduceMotion = useReducedMotion();

  // One orchestrated reveal for the hero; everything below stays still until
  // the person interacts with it.
  const reveal = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease, delay },
        };

  return (
    <main
      className={cn(
        mono.className,
        "min-h-screen overflow-x-clip bg-[#0a0a08] text-[#f3efe4]",
      )}
    >
      <section
        aria-labelledby="team-heading"
        className="relative isolate min-h-[88svh] overflow-hidden border-b border-[#f3efe4]/10 px-6 pb-16 pt-32 sm:px-10 lg:px-16"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_40%,rgba(255,59,48,0.18),transparent_38%),linear-gradient(180deg,rgba(10,10,8,0.2),#0a0a08_90%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full opacity-45 lg:w-[58%] lg:opacity-100">
          <TeamCore seats={Math.max(members.length, 1)} />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[66svh] w-full max-w-7xl flex-col justify-center">
          <div className="max-w-5xl">
            <h1
              id="team-heading"
              className={cn(
                anton.className,
                "text-[clamp(4rem,15vw,12rem)] uppercase leading-[0.8] tracking-[-0.04em]",
              )}
            >
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  {...(reduceMotion
                    ? {}
                    : {
                        initial: { y: "110%" },
                        animate: { y: "0%" },
                        transition: { duration: 1.1, ease, delay: 0.1 },
                      })}
                >
                  The
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-transparent"
                  style={{ WebkitTextStroke: "2px #f3efe4" }}
                  {...(reduceMotion
                    ? {}
                    : {
                        initial: { y: "110%" },
                        animate: { y: "0%" },
                        transition: { duration: 1.1, ease, delay: 0.22 },
                      })}
                >
                  C-Suite
                </motion.span>
              </span>
            </h1>

            <motion.div
              {...reveal(0.6)}
              className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
            >
              <p
                className={cn(
                  playfair.className,
                  "max-w-md text-xl italic leading-relaxed text-[#f3efe4]/75 sm:text-2xl",
                )}
              >
                The people who run Generation Uprising.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="leadership"
        aria-labelledby="leadership-heading"
        className="bg-[#f3efe4] px-6 py-24 text-[#0a0a08] sm:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 border-b border-[#0a0a08]/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="leadership-heading"
              className={cn(
                anton.className,
                "text-5xl uppercase leading-none sm:text-7xl",
              )}
            >
              Leadership
            </h2>
          </div>

          {members.length > 0 ? (
            <ul className="divide-y divide-[#0a0a08]/15 border-y border-[#0a0a08]/15">
              {members.map((member) => (
                <motion.li
                  key={member.id}
                  whileHover={reduceMotion ? undefined : { x: 12 }}
                  transition={{ duration: 0.3, ease }}
                  className="group relative flex flex-col gap-2 py-7 sm:flex-row sm:items-center sm:gap-6"
                >
                  <span
                    aria-hidden
                    className="hidden h-2.5 w-2.5 shrink-0 rounded-full sm:block"
                    style={{ backgroundColor: RED }}
                  />
                  <h3
                    className={cn(
                      anton.className,
                      "flex-1 break-words text-3xl uppercase leading-tight sm:text-5xl",
                    )}
                  >
                    {member.name}
                  </h3>
                  <p className="text-[0.7rem] uppercase tracking-[0.25em] text-[#0a0a08]/70 sm:text-right">
                    {member.position}
                  </p>
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#ff3b30] transition-transform duration-500 group-hover:scale-x-100"
                  />
                </motion.li>
              ))}
            </ul>
          ) : (
            <output className="border border-dashed border-[#0a0a08]/25 py-16 text-center text-xs uppercase tracking-[0.3em] text-[#0a0a08]/70">
              {errorMessage ?? "No team members found."}
            </output>
          )}
        </div>
      </section>
    </main>
  );
}