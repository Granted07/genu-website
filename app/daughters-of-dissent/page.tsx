"use client";
import React, { useMemo, useState, useEffect } from "react";
import Link from 'next/link'
import { motion } from "framer-motion";
import { Clip1 } from "@/components/clips";

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.1, duration: 0.5 },
    }),
    exit: { opacity: 0, y: 0, transition: { duration: 1 } },
    viewport: { once: true },
};

type Item = { uuid?: string; title: string; content: string; image?: string };

export default function DaughtersOfDissentPage() {
    const [items, setItems] = useState<Item[]>([])
    const shuffled = useMemo(() => {
        const a = [...items]
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
        }
        return a
    }, [items])
    const randoms = useMemo(() => Array.from({ length: Math.max(1, shuffled.length) }, () => Math.random()), [shuffled.length]);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/dod')
                if (res.ok) {
                    const json = await res.json()
                    const mapped = (json.data || []).map((r: any) => ({ uuid: r.uuid, title: r.title || r.author || 'Untitled', content: r.content || '', image: r.image || '' }))
                    setItems(mapped)
                }
            } catch (err) {
                console.error(err)
            }
        }
        load()
    }, [])

    return (
        <div className="max-w-dvw max-h-screen overflow-hidden">
            <div className="h-screen w-screen from-zinc-600 to-background from-[-30%] to-[70%] bg-gradient-to-t absolute"></div>
            <div className="z-10 max-h-screen overflow-scroll">
                <div className="mb-0 mt-24 text-center text-8xl font-extrabold relative z-10">
                    <h1>daughters <br/> of dissent</h1>
                    <p className="text-xl font-light pt-5 tracking-widest">rebellion looks like her</p>
                </div>
                <div className="overflow-scroll min-h-dvh max-w-dvw flex z-10 justify-center items-center flex-wrap relative gap-14 overflow-x-hidden p-10 ">
                                {shuffled.map((item, idx) => (
                                    <Link key={`${item.title}-${idx}`} href={`/daughters-of-dissent/${item.uuid}`} className="no-underline">
                                        <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }} custom={idx} whileHover={{ scale: 1.03, rotate: 0.5 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} style={{ rotate: randoms[idx] * 3 - 1.5 }} className="z-[2]">
                                            <Clip1 title={item.title} description={item.content} image={item.image} />
                                        </motion.div>
                                    </Link>
                                ))}
                </div>
            </div>
        </div>
    )
}
