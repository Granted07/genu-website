"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import {motion} from "framer-motion";


const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: (index: number) => ({ 
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.2,
      duration: 1
    }
  }),
  viewport: { once: true }
}

export default function Home() {
  return (
    <div className=" font-rethink-sans min-h-screen gap-16 ">

      <Image
        src="/bg.png"
        alt="Background"
        fill
        className="object-fill w-screen h-screen -z-10 opacity-30 fixed top-0 left-0"
        priority
        
      />

      <main className="flex flex-col gap-3 h-screen w-screen items-center justify-center">

        <div className="flex flex-col sm:flex-row p-10 sm:pr-0 md:flex-row gap-10 sm:gap-40 row-start-2 w-screen sm:items-center justify-center items-start ">
          <div className="flex flex-col items-start justify-center gap-2">
            <motion.p 
            variants={fadeInUp}
            initial="initial"
            whileInView={"animate"}
            custom={0}
            className="text-2xl sm:text-4xl font-light text-left font-rethink-sans">
              welcome to
            </motion.p>
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView={"animate"}
              custom={1}
              className="flex flex-col justify-center items-start w-full text-6xl sm:text-7xl md:text-8xl lg:text-9xl -tracking-[2px] sm:-tracking-[6px] lg:-tracking-[10px]"
            >
              <span className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Genu Logo"
                width={30}
                height={30}
                className="object-cover w-[39px] sm:w-[47px] md:w-[60px] lg:w-[84px]"
              />
              <span className="">ENERATION</span>
              </span>
              <span>UPRISING</span>
            </motion.div>

          </div>

          <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView={"animate"}
              custom={2}
              className="text-2xl text-center sm:max-w-md bg-primary p-6 text-background">
                a youth-led movement transforming civic awareness into collective action for a just future.
          </motion.div>

        </div>

        <motion.div 
        variants={fadeInUp}
        initial="initial"
        whileInView={"animate"}
        custom={3}
        className="flex-row flex gap-10 w-screen justify-center text-xl sm:text-2xl">
          <Button className="font-rethink-sans min-w-[12%] hover:cursor-pointer font-normal px-9 py-8 rounded-3xl"  variant={`secondary`}>know more</Button>
          <Button className="font-rethink-sans min-w-[12%] hover:cursor-pointer font-normal px-9 py-8 rounded-3xl">join us</Button>
        </motion.div>

      </main>

    </div>
  );
}
