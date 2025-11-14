"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

export default function HallOfNoiseComingSoon() {
  const prefersReducedMotion = useReducedMotion()

	return (
		<motion.div
			initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
			animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
			transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
			className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 px-6 py-16 text-white"
		>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_rgba(8,8,8,0.94)_58%)]" />
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,14,14,0.7),rgba(12,12,12,0.94))]" />

			<motion.div
				initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
				animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
				transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: prefersReducedMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
				className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center"
			>
				<motion.h1
					initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
					animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
					transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.25, ease: [0.25, 1, 0.5, 1] }}
					className="text-balance text-[clamp(2.8rem,7vw,4.4rem)] font-semibold uppercase leading-tight tracking-[0.3em] text-white/90"
				>
					Hall of Noise
				</motion.h1>
				<motion.p
					initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
					animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
					transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.35, ease: [0.25, 1, 0.5, 1] }}
					className="max-w-xl text-[0.78rem] uppercase tracking-[0.42em] text-white/65"
				>
					Audio dispatches on landmark cases, dissenting opinions, and the politics shaping tomorrow. The first series is still in edit.
				</motion.p>

				<motion.p
					initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
					animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
					transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.45, ease: [0.25, 1, 0.5, 1] }}
					className="text-[0.68rem] uppercase tracking-[0.38em] text-white/55"
				>
					While the newsroom records, visit <Link href="/case-files" className="underline decoration-white/30 underline-offset-4 transition hover:decoration-white">case files</Link>, <Link href="/signals" className="underline decoration-white/30 underline-offset-4 transition hover:decoration-white">signals</Link> or <Link href="/daughters-of-dissent" className="underline decoration-white/30 underline-offset-4 transition hover:decoration-white">daughters of dissent</Link> to stay briefed.
				</motion.p>
			</motion.div>

			<motion.div
				initial={prefersReducedMotion ? { opacity: 0.6 } : { opacity: 0.4, scale: 0.9 }}
				animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.35, 0.55, 0.4], scale: [0.96, 1.04, 0.98] }}
				transition={prefersReducedMotion ? { duration: 0 } : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
				className="pointer-events-none absolute -top-24 left-10 h-60 w-60 rounded-[36%] bg-emerald-300/14 blur-2xl"
			/>
			<motion.div
				initial={prefersReducedMotion ? { opacity: 0.6 } : { opacity: 0.35, scale: 0.92 }}
				animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.35, 0.5, 0.38], scale: [0.94, 1.06, 0.98] }}
				transition={prefersReducedMotion ? { duration: 0 } : { duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
				className="pointer-events-none absolute bottom-[-3rem] right-14 h-72 w-72 rounded-[30%] bg-amber-200/12 blur-3xl"
			/>
		</motion.div>
	)
}
