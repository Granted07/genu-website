
"use client"

import { motion } from "framer-motion"
import { Manrope, Playfair_Display } from "next/font/google"

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

const easing = [0.19, 1, 0.22, 1] as [number, number, number, number]

const cardPostures = [
    { rotate: -4, x: -12, y: 6 },
    { rotate: 3, x: 8, y: -4 },
    { rotate: -2, x: -6, y: 2 },
    { rotate: 4, x: 10, y: -6 },
    { rotate: -3, x: -8, y: 4 },
    { rotate: 2, x: 6, y: -2 }
]

const floatingSquares = [
    "-top-24 left-[8%] h-40 w-40 rotate-[22deg] bg-white/15",
    "top-[22%] right-[12%] h-28 w-28 rotate-[-18deg] bg-amber-300/20",
    "bottom-[18%] left-[6%] h-20 w-20 rotate-[12deg] bg-white/12",
    "bottom-[-12%] right-[10%] h-32 w-32 rotate-[16deg] bg-white/18"
]

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (index: number) => {
        const posture = cardPostures[index % cardPostures.length]
        return {
            opacity: 1,
            y: posture.y,
            transition: {
                delay: index * 0.08,
                duration: 0.65,
                ease: easing
            }
        }
    }
}

const sponsors = [
    {
        name: "Subhas Seth",
        description: "Our director's father, a superb dentist and overall a master at his field"
    },
    {
        name: "Sambit Seth",
        description: "Our very efficient and productive director with a knack for multitasking"
    },
    {
        name: "Awtar Vishwakarma",
        description: "Excellent PR member, even better sense of humor"
    },
    {
        name: "Subham Gupta",
        description: "No longer with us sadly, but his support for a noble cause is appreciated and felt"
    },
    {
        name: "Priyasha Chakraborty",
        description: "Our treasured treasurer with amazing inputs each time"
    },
    {
        name: "Sanvi Dutta",
        description: "Our head of public relations, also an avid chess player and classical music enthusiast"
    }
]

const heroVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.12,
            duration: 0.7,
            ease: easing
        }
    })
}

const SponsorsPage = () => {
    return (
        <div
            className={`${manrope.className} relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_rgba(0,0,0,0.92)_55%)] text-white`}
        >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,0.72),rgba(11,11,11,0.96))]" />

            {floatingSquares.map((classes, index) => (
                <div key={classes} aria-hidden className={`pointer-events-none absolute z-0 rounded-[18%] blur-[0.5px] ${classes}`} />
            ))}

            <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-28 sm:px-10">
                <motion.div
                    className="flex flex-col items-center gap-6 text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <motion.p
                        variants={heroVariants}
                        custom={0}
                        className="text-[0.7rem] uppercase tracking-[0.6em] text-white/55"
                    >
                        Our Sponsors
                    </motion.p>
                    <motion.h1
                        variants={heroVariants}
                        custom={1}
                        className={`${playfair.className} text-balance text-[clamp(2.8rem,8vw,4.5rem)] font-semibold uppercase leading-[0.9]`}
                    >
                        our sponsors
                    </motion.h1>
                    <motion.p
                        variants={heroVariants}
                        custom={2}
                        className="max-w-2xl text-balance text-xs uppercase tracking-[0.45em] text-white/70"
                    >
                        a salute to the allies, partners, and anonymous benefactors suporting our movement.
                    </motion.p>
                </motion.div>

                <div className="flex flex-col gap-12">
                    {[sponsors.slice(0, 3), sponsors.slice(3, 6)].map((row, rowIndex) => (
                        <div key={`row-${rowIndex}`} className="grid gap-8 sm:grid-cols-3">
                                            {row.map((sponsor, index) => {
                                                const globalIndex = rowIndex * 3 + index
                                                const posture = cardPostures[globalIndex % cardPostures.length]

                                                return (
                                                    <motion.div
                                                        key={sponsor.name}
                                                        variants={cardVariants}
                                                        custom={globalIndex}
                                                        initial="hidden"
                                                        whileInView="visible"
                                                        viewport={{ once: true, amount: 0.3 }}
                                                        whileHover={{ scale: 1.02, y: posture.y - 16, rotate: posture.rotate * 0.6 }}
                                                        style={{ x: posture.x }}
                                                        className="group"
                                                    >
                                                        <motion.div
                                                            animate={{ y: [0, -10, 4, 0] }}
                                                            transition={{ duration: 7 + index, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                                                            className="relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10 p-10 text-left text-white shadow-[0_18px_46px_rgba(0,0,0,0.35)] backdrop-blur"
                                                            style={{ rotate: posture.rotate }}
                                                        >
                                                            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(120deg,transparent_0,transparent_16px,rgba(255,255,255,0.08)_16px,rgba(255,255,255,0.08)_18px)] opacity-40 transition-opacity group-hover:opacity-60" />
                                                            <div className="pointer-events-none absolute inset-[14px] rounded-[1.35rem] border border-white/15 opacity-80" />

                                                            <div className="relative z-10 space-y-4">
                                                                <p className="text-[0.62rem] uppercase tracking-[0.45em] text-white/60">Patron</p>
                                                                <h2 className={`${playfair.className} text-2xl font-semibold uppercase leading-none`}>{sponsor.name}</h2>
                                                                <p className={`${playfair.className} text-sm leading-relaxed text-white/80`}>{sponsor.description}</p>
                                                            </div>

                                                            <div className="relative z-10 mt-10 flex items-center justify-between text-[0.6rem] uppercase tracking-[0.4em] text-white/55">
                                                                <span>With gratitude</span>
                                                                <span>→</span>
                                                            </div>
                                                        </motion.div>
                                                    </motion.div>
                                                )
                                            })}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default SponsorsPage
