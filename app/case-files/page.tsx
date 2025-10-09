"use client";
import { useMemo, useRef } from "react";
import React from "react";
import { motion, useAnimate, useScroll } from "framer-motion";
import { Clip1, Clip2 } from "@/components/clips";
import Noise from "@/components/Noise";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { div } from "framer-motion/m";

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

const CaseFiles = [
  {
    title: "Case File 1",
    body: "Description for case file 1",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 2",
    body: "Description for case file 2",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
  {
    title: "Case File 3",
    body: "Description for case file 3",
    image:
      "https://cms-resources.prd.timeshighereducation.com/sites/default/files/styles/featured_image/public/2023-05/iStock-1060172678.jpg?itok=uaOui1rn",
  },
];

export default function CaseFilesPage() {
  const randoms = useMemo(
    () => Array.from({ length: CaseFiles.length }, () => Math.random()),
    []
  );

  return (
    <div className="max-w-dvw">
      <div className="mb-0 mt-24 text-center text-8xl font-extrabold relative">
        <div className="h-32 w-32 bg-yellow-300 right-15 top-30 absolute rotate-[13deg] -z-[1] sm:top-23 lg:hidden"></div>
        <h1>
          case <br /> files
        </h1>
      </div>
      <div className="min-h-dvh max-w-dvw flex justify-center items-center flex-wrap relative gap-14 overflow-x-hidden p-10 ">
        {CaseFiles.map((caseFile, idx) => {
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
                description={caseFile.body}
                image={caseFile.image}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
