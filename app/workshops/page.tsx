import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import WorkshopCard from "@/components/workshopCard";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

async function getWorkshops() {
  const res = await fetch("http://localhost:3000/api/workshops", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch workshops");
  }

  return (await res.json()).data;
}


export default async function WorkshopsPage() {
  const workshops = await getWorkshops();

  return (
    <div className="relative min-h-screen overflow-hidden ">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,0.6),rgba(15,15,15,0.95))]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-40 sm:pt-48 sm:px-10 flex flex-col items-center gap-16">
        <div className="flex w-full flex-col items-center gap-6 text-center text-white">
          <div className="space-y-3">
            <p className="text-[0.6rem] uppercase tracking-[0.65em] text-white/45">
              Workshops
            </p>
            <h1 className={`${playfair.className} text-balance text-[clamp(2.5rem,7vw,4rem)] font-semibold uppercase leading-[0.9]`}>
              workshops
            </h1>
            <p className="text-xs font-medium uppercase tracking-[0.45em] text-white/55 sm:text-sm">
              curious minds meet here
            </p>
          </div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-8">
            {workshops.map((workshop: any, index: number) => (
              <Link
                key={workshop.uuid || `${workshop.title}-${index}`}
                href={`/workshops/${workshop.uuid || ""}`}
                className="block w-full"
              >
                <WorkshopCard
                  number={workshop.number}
                  title={workshop.title}
                  location={workshop.location}
                  category={workshop.category}
                  summary={workshop.summary}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
