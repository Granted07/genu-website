"use client";
import { useRef } from "react";
import React from "react";
import { motion, useAnimate, useScroll } from "framer-motion";
import {
  ClipFirst1,
  ClipFirst2,
  ClipSecond1,
  ClipSecond2,
  ClipSecond3,
  ClipSecond4,
} from "@/components/clips";
import Noise from "@/components/Noise";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { div } from "framer-motion/m";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.2,
      duration: 1,
    },
  }),
  exit: { opacity: 0, y: 0, transition: { duration: 1 } },
  viewport: { once: true },
};

const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  viewport: { once: true },
};

export default function CaseFilesPage() {
  const targetRef = useRef(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const slideCount = 17; // 18 - 1 (skipping i === 2)
  const [randoms, setRandoms] = React.useState<number[]>([]);
  React.useEffect(() => {
    setRandoms(Array.from({ length: 18 }, () => Math.random()));
  }, []);

  // Scroll to the current slide on mobile
  React.useEffect(() => {
    if (mobileScrollRef.current) {
      const child = mobileScrollRef.current.children[
        currentSlide
      ] as HTMLElement;
      if (child) {
        child.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    }
  }, [currentSlide]);

  // Get valid slide indices (skip i === 2)
  const validIndices = Array.from({ length: 18 })
    .map((_, i) => i)
    .filter((i) => i !== 2);

  return (
    <div className="max-w-dvw">
      <div className="mb-24 mt-24 text-center text-8xl font-extrabold relative">
        <div className="h-32 w-32 bg-yellow-300 right-32 top-0 absolute rotate-[13deg] hidden md:block"></div>
        <h1>
          case <br /> files
        </h1>
      </div>
      <div className="min-h-dvh max-w-dvw flex justify-center items-center flex-wrap relative gap-14 overflow-x-hidden p-10 ">
        <ClipFirst1 />
        <ClipFirst2 />
        <ClipSecond1 />
        <ClipSecond2 />
        <ClipSecond3 />
        <ClipSecond4 />
      </div>
    </div>
  );
}
