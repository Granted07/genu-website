
"use client"
import React from 'react'
import { motion } from 'framer-motion'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
}

const fadeInUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const AboutPage: React.FC = () => {
    return (
        <main className="mt-[68px] w-screen sm:py-0 py-10">
            <div className="h-screen w-screen from-zinc-600 to-background from-[-30%] to-[70%] bg-gradient-to-t absolute -z-10"></div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container} className="max-w-full">
                <motion.h1 variants={fadeInUp} className=" pb-8 text-8xl font-rethink-sans font-extrabold w-full text-center">our sponsors</motion.h1>
                <motion.h2 variants={fadeInUp} className=" text-3xl font-rethink-sans font-bold tracking-wide text-center mx-auto sm:max-w-[40%]">a salute to the allies, partners, and anonymous benefactors suporting our movement.</motion.h2>

                <div className="flex flex-col sm:flex-row w-screen justify-between gap-5 px-20 pt-10">
                    <motion.div variants={fadeInUp} className="bg-white text-black p-10 flex flex-col sm:max-w-[25%]">
                        <h1 className="text-xl font-rethink-sans font-extrabold">Subhas Seth</h1>
                        <p className="">Our director's father, a superb dentist and overall a master at his field</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="bg-white text-black p-10 flex flex-col sm:max-w-[25%]">
                        <h1 className="text-xl font-rethink-sans font-extrabold">Sambit Seth</h1>
                        <p className="">Our very efficient and productive director with a knack for multitasking</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="bg-white text-black p-10 flex flex-col sm:max-w-[25%]">
                        <h1 className="text-xl font-rethink-sans font-extrabold">Awtar Vishwakarma</h1>
                        <p className="">Excellent PR member, even better sense of humor</p>
                    </motion.div>
                </div >

                <div className="flex flex-col sm:flex-row w-screen justify-between gap-5 px-20 pt-10">
                    <motion.div variants={fadeInUp} className="bg-white text-black p-10 flex flex-col sm:max-w-[25%]">
                        <h1 className="text-xl font-rethink-sans font-extrabold">Subham Gupta</h1>
                        <p className="">No longer with us sadly, but his support for a noble cause is appreciated and felt</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="bg-white text-black p-10 flex flex-col sm:max-w-[25%]">
                        <h1 className="text-xl font-rethink-sans font-extrabold">Priyasha Chakraborty</h1>
                        <p className="">Our treasured treasurer with amazing inputs each time</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="bg-white text-black p-10 flex flex-col sm:max-w-[25%]">
                        <h1 className="text-xl font-rethink-sans font-extrabold">Sanvi Dutta</h1>
                        <p className="">Our head of public relations, also an avid chess player and classical music enthusiast</p>
                    </motion.div>
                </div>
            </motion.div>
        </main>
    );
};

export default AboutPage;
