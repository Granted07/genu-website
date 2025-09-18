"use client"
import { useRef } from "react";
import React from "react";
import {motion, useAnimate, useScroll} from "framer-motion";
import {Clip1, Clip2} from "@/components/clips";
import Noise from "@/components/Noise";
import { ChevronLeft, ChevronRight } from "lucide-react";


const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: (index: number) => ({ opacity: 1, y: 0, transition: { 
        delay: index * 0.2,
        duration: 1
    } }),
    exit: { opacity: 0, y: 0, transition: { duration: 1 } },
    viewport: { once: true }
}

const fadeInDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { 
        duration: 0.5 
    } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    viewport: { once: true }
}


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
            const child = mobileScrollRef.current.children[currentSlide] as HTMLElement;
            if (child) {
                child.scrollIntoView({ behavior: "smooth", inline: "center" });
            }
        }
    }, [currentSlide]);

    // Get valid slide indices (skip i === 2)
    const validIndices = Array.from({ length: 18 }).map((_, i) => i).filter(i => i !== 2);

    return (
        <div ref={targetRef} className="flex flex-col items-center bg-zinc-900 justify-center px-4 sm:px-20]">
            
            <div className="absolute w-screen h-screen top-0 left-0 -z-10 overflow-hidden">
            <Noise
                patternRefreshInterval={2}
                patternAlpha={7}
            />
            </div>

            <div
                className="w-full max-h-screen box-content noscroll "
                style={{
                    overflowY: "auto",
                    scrollSnapType: "y mandatory"
                }}
            >
                {/* Desktop: grid, Mobile: horizontal scroll */}
                <div className="sm:grid sm:grid-cols-3 grid-cols-1 items-center pb-10 ">
                    {/* Mobile horizontal scroll container */}
                    <div ref={mobileScrollRef} className="sm:hidden relative flex flex-row noscroll overflow-x-auto overflow-y-hidden space-x-4 pb-30">
                        {validIndices.map((i, idx) => (
                            <motion.div
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                variants={fadeInUp}
                                custom={i % 3}
                                key={i}
                                viewport={{ once: true }}
                                className="min-w-[80vw] h-[50vw] scale-60 -translate-y-14 relative flex-shrink-0"
                            >
                                {randoms[i] !== undefined && randoms[i] < 0.5 ? <Clip1 /> : <Clip2 />}
                            </motion.div>
                        ))}
                    </div>
                    <div className="sm:hidden left-0 top-1/3 absolute w-screen justify-around gap-[60%] z-10 flex">
                        <ChevronLeft
                            onClick={() => setCurrentSlide(s => Math.max(s - 1, 0))}
                            className="cursor-pointer"
                        />
                        <ChevronRight
                            onClick={() => setCurrentSlide(s => Math.min(s + 1, validIndices.length - 1))}
                            className="cursor-pointer"
                        />
                    </div>
                    {/* Desktop grid */}
                    <div className="hidden sm:contents">
                        {validIndices.map((i, idx) => (
                            <motion.div
                                initial="initial"
                                whileInView="animate"
                                exit="exit"
                                variants={fadeInUp}
                                custom={i % 3}
                                key={i}
                                className={`h-screen scale-90 relative ${i % 3 === 0 ? "scroll-snap-start" : ""}`}
                                style={i % 3 === 0 ? { scrollSnapAlign: "start" } : {}}
                            >
                                {randoms[i] !== undefined && randoms[i] < 0.5 ? <Clip1 /> : <Clip2 />}
                            </motion.div>
                        ))}
                    </div>
                    <motion.div
                        className="mx-auto sm:text-8xl text-6xl text-center font-rethink-sans font-bold col-start-2 row-end-1"
                        initial="initial"
                        ref={targetRef}
                        whileInView={"animate"}
                        exit="exit"
                        variants={fadeInDown}
                    >
                        case <br /> files
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
