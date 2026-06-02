import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";


const Hero = () => {
  return (
    <section className="relative min-h-dvh overflow-hidden bg-[#0b0b0b] text-white mb-40">
      <div className="  absolute inset-0 opacity-75">
        <Image
          src="/hero-workshop.jpeg"
          alt="Workshop audience gathered in a learning space"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.90)_48%,rgba(0,0,0,0.86)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_36%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.42)_38%,rgba(0,0,0,0.92)_100%)]" />
      </div>


      <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 md:px-16 lg:px-10 gap-6 max-w-7xl mx-auto max-md:items-center max-md:text-center max-md:left-1/2 max-md:-translate-x-1/2">
        <p className="font-rethink-sans text-sm md:text-base  tracking-[0.35em] text-[#FFDF5F] leading-[1.2em] drop-shadow-2xl drop-shadow-gray-900 uppercase">
          WHAT WE BUILD TOGETHER . WHAT WE DO TOGETHER
        </p>
        <h1 className="workshop-heading">
          WORKSHOPS FOR <br /> CURIOUS MINDS
        </h1>
        <p className="font-rethink-sans text-lg md:text-xl max-w-2xl text-white/60 leading-[1.25em] drop-shadow-2xl drop-shadow-gray-700">
          Spaces to learn, question, unleash yourself and more. Lots of exciting
          opportunities to do whatever you like for obvious reasons.
        </p>
        <Button variant="outline" size="lg" className="group max-w-sm rounded-4xl ring-2 ring-white/50 hover:ring-1 active:scale-95 transition-all duration-300">
          Explore Workshops
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      
    </section>
  );
};

export default Hero;
