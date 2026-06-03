"use client";

import { Poppins, Red_Hat_Display } from "next/font/google";
import { type MouseEvent, useState } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface WorkshopCardProps {
  number?: string;
  title: string;
  location?: string;
  category?: string;
  summary?: string;
}

const workshopCard = ({
  number,
  title,
  location,
  category,
  summary,
}: WorkshopCardProps) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-[320px] md:h-auto md:aspect-square mx-auto rounded-[24px] md:rounded-[32px] border border-white/[0.08] bg-[#121212]/35 backdrop-blur-[40px] overflow-hidden p-6 md:p-8 flex flex-col justify-between hover:scale-[1.01] hover:bg-[#121212]/45 hover:border-white/12 transition-all duration-300 ease-out group select-none"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, rgba(255, 223, 95, 0.15), transparent 80%)`,
        }}
      />

      <div className="absolute right-0 top-[-20px] md:left-30 md:bottom-0 lg:left-25 lg:top-[-50px] z-0 select-none pointer-events-none font-rethink-sans font-bold leading-none text-white/[0.035] text-[400px] md:text-[500px] lg:text-[450px] transition-all duration-300 group-hover:text-white/[0.045]">
        {number}
      </div>

      <div className="relative z-20 flex flex-col justify-between h-full w-full">
        <div>
          <h2 className="font-rethink-sans font-bold text-white leading-[1.1] text-xl md:text-2xl lg:text-[26px] tracking-tight">
            {title}
          </h2>
          <p
            className={`${poppins.className} text-white/60 font-normal text-sm md:text-sm lg:text-[15px] mt-2 lg:mt-3`}
          >
            {location}
          </p>
          {summary && (
            <p
              className={`${poppins.className} text-white/50 font-normal text-xs md:text-sm mt-3 md:mt-4 line-clamp-3`}
            >
              {summary}
            </p>
          )}
        </div>

        <p
          className={`${redHatDisplay.className} text-white/40 text-xs md:text-xs lg:text-[13px] tracking-[0.20em] font-medium mt-auto pt-4`}
        >
          {category}
        </p>
      </div>
    </div>
  );
};

export default workshopCard;
