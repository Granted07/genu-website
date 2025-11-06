"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Manrope, Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const easingCurve = [0.19, 1, 0.22, 1] as [number, number, number, number];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.12,
      duration: 0.7,
      ease: easingCurve,
    },
  }),
};

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  const router = useRouter();

  return (
    <div
      className={`${manrope.className} relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(0,0,0,0.94)_55%)] text-white before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(15,15,15,0.7),rgba(15,15,15,0.95))] before:content-['']`}
    >
      <Image
        src="/bg.png"
        alt="Background"
        fill
        className="pointer-events-none object-cover opacity-25"
        priority
      />

      <main className="relative z-10 flex h-dvh w-full flex-col items-center justify-center px-6 py-16 sm:px-10">
        <div className="flex w-full max-w-6xl flex-row items-center gap-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-xl flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <motion.p
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={0}
              className="text-[1rem] uppercase tracking-[0.55em] text-white/60"
            >
              Welcome to
            </motion.p>
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={1}
              className="space-y-3"
            >
              <span className="flex items-center justify-center gap-4 sm:justify-start">
                <span
                  className={`${playfair.className} text-[clamp(2.75rem,8vw,4.5rem)] font-semibold uppercase leading-[0.9] tracking-[0.08em]`}
                >
                  Generation
                </span>
              </span>
              <span
                className={`${playfair.className} block text-center text-[clamp(3rem,9vw,5.5rem)] font-semibold uppercase leading-[0.88] tracking-[0.12em] sm:text-left`}
              >
                Uprising
              </span>
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={2}
            className="max-w-md rounded-[1.5rem] self-end border border-white/20 bg-white/10 p-8 text-balance text-sm uppercase tracking-[0.4em] text-white/80 backdrop-blur"
          >
            a youth-led movement transforming civic awareness into collective
            action for a just future.
          </motion.div>
        </div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          custom={3}
          className="mt-16 flex w-full max-w-3xl flex-col gap-4 text-[0.78rem] uppercase tracking-[0.35em] sm:flex-row sm:gap-6"
        >
          <Button
            onClick={() => router.push("/sponsors")}
            variant="secondary"
            className="flex-1 rounded-full border border-white/25 bg-white/15 px-8 py-6 text-center text-white transition hover:border-white/60 hover:bg-white/25"
          >
            Know More
          </Button>
          <Button
            onClick={() => router.push("/case-files")}
            className="flex-1 rounded-full border border-white/0 bg-white px-8 py-6 text-center text-neutral-900 transition hover:bg-neutral-200"
          >
            Our Work
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
