import { Button } from "@/components/ui/button";
import Image from "next/image";

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

      <main className="flex flex-col sm:gap-28 sm:h-screen w-screen items-center justify-start sm:justify-center pt-[74px]">

        <div className="flex flex-col sm:flex-row p-10 sm:pr-0 md:flex-row gap-[32px] row-start-2 w-screen sm:items-center items-start ">
              <div className="flex flex-col items-start justify-center gap-2">
                <p className="text-2xl sm:text-4xl font-light text-left font-rethink-sans">
                  welcome to
                </p>
                <Image
                    src="/FULLTEXT.svg"
                    alt="Genu Logo"
                    width={700}
                    height={700}
                    priority
                    className="object-cover max-w-xs sm:max-w-md lg:max-w-lg"
                />
              </div>

          <div className="flex flex-row justify-end items-center w-full sm:scale-100 scale-80">
              <div className="text-2xl text-center sm:max-w-md bg-primary p-6 text-background">
                a youth-led movement transforming civic awareness into collective action for a just future.
              </div>
          </div>

        </div>

        <div className="flex-row flex gap-10 w-screen justify-center text-xl">
          <Button className="font-rethink-sans min-w-[10%] hover:cursor-pointer font-extralight px-7">know more</Button>
          <Button className="font-rethink-sans min-w-[10%] hover:cursor-pointer font-extralight px-7" variant={`secondary`}>join us</Button>
        </div>

      </main>

    </div>
  );
}
