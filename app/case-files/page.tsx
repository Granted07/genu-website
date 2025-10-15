"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, useAnimate, useScroll } from "framer-motion";
import ReactMarkdown from 'react-markdown'
import { Clip1, Clip2 } from "@/components/clips";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
    },
  }),
  exit: { opacity: 0, y: 0, transition: { duration: 1 } },
  viewport: { once: true },
};

// const fadeInDown = {
//   initial: { opacity: 0, y: -20 },
//   animate: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//     },
//   },
//   exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
//   viewport: { once: true },
// };

type CaseFile = { uuid?: string; title: string; content: string; image?: string }

export default function CaseFilesPage() {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([])
  const randoms = useMemo(() => Array.from({ length: Math.max(1, caseFiles.length) }, () => Math.random()), [caseFiles.length]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/casefiles')
        if (res.ok) {
          const json = await res.json()
          // Map database fields to display fields
          const mapped = (json.data || []).map((r: any) => ({ uuid: r.uuid, title: r.title || 'Untitled', content: r.content || '', image: r.image || '' }))
          setCaseFiles(mapped)
        }
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-dvw">
      <div className="mb-0 mt-24 text-center text-8xl font-extrabold relative">
        <h1>
          case <br /> files
        </h1>
      </div>
      <div className="min-h-dvh max-w-dvw flex justify-center items-center flex-wrap relative gap-14 overflow-x-hidden p-10 ">
        {caseFiles.map((caseFile, idx) => {
          const useClipp = randoms[idx] < 0.5;
          const Clip = useClipp ? Clip1 : Clip2;
          return (
            <motion.div
              key={`${caseFile.title}-${idx}`}
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.2 }}
              custom={idx}
              whileHover={{ scale: 1.03, rotate: 0.5 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{ rotate: randoms[idx] * 3 - 1.5 }}
              className="-z-[2]"
            >
              <Clip
                title={caseFile.title}
                description={<ReactMarkdown>{caseFile.content || ''}</ReactMarkdown>}
                image={caseFile.image}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
