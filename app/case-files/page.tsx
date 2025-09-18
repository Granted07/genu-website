"use client"
import { useRef } from "react";
import React from "react";
import {motion, useAnimate, useScroll} from "framer-motion";
import {Clip1, Clip2, Clip3} from "@/components/clips";


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


export default function CaseFiles() {
    const targetRef = useRef(null);
    const {scrollYProgress} = useScroll({
        target: targetRef,
        axis: "y"
    })

    
    return (
        <div ref={targetRef} className="flex min-h-screen flex-col items-center bg-zinc-900 justify-center px-20">
            <div
            className="w-full max-h-screen box-content noscroll"
            style={{
                overflowY: "auto",
                scrollSnapType: "y mandatory"
            }}
            >
                <div className="grid grid-cols-3 grid-rows-6 items-center py-20">
                    {Array.from({ length: 18 }).map((_, i) => (
                        i !== 2 && (
                            <motion.div
                                initial="initial"
                                whileInView="animate"
                                exit="exit"
                                variants={fadeInUp}
                                custom={i % 3}
                                key={i}
                                className={`h-screen relative ${i % 3 === 0 ? "scroll-snap-start" : ""}`}
                                style={i % 3 === 0 ? { scrollSnapAlign: "start" } : {}}
                            >
                                <Clip1 />
                            </motion.div>
                        )
                    ))}
                    
                    <motion.div
                        className="mx-auto text-8xl text-center font-rethink-sans font-bold col-start-2 row-end-1"
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
