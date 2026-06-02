import React from 'react'
import { text } from 'stream/iter'
import Link from 'next/link'

const LiquidGlassButton = ({text, link}: {text: string, link: string}) => {
  return (
    <div>
      <Link href={link}>
        <button className={"z-20 inset-shadow-white-500 rounded-3xl border border-white/10   bg-transparent tracking-wider text-white/10 backdrop-blur-sm hover:scale-105 transition duration-300 hover:bg-white/1.5 inset-shadow-sm inset-shadow-white/5 shadow-lg active:scale-95 "}>

      <div className="flex h-full w-full items-center justify-center rounded-3xl bg-radial-[at_75%_100%] from-white/20 to-zinc-900/5 to-40% shadow-xs">
        <div className="flex h-full w-full items-center justify-center rounded-3xl bg-radial-[at_-110%_-100%] from-white/1 via-white/5 to-transparent to-60%">
          <div className="flex h-full w-full items-center justify-center rounded-3xl bg-radial-[at_-110%_-100%] from-white/1 via-white/5 to-transparent to-60%">
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-radial-[at_-110%_-100%] from-white/1 via-white/5 to-transparent to-60%">
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-radial-[at_-110%_-100%] from-white/1 via-white/5 to-transparent to-60%">
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-radial-[at_-110%_-100%] from-white/1 via-white/5 to-transparent to-60%">
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-radial-[at_-110%_-100%] from-white/1 via-white/5 to-transparent to-60%">{text}</div>
            </div></div></div>
          </div>
        </div>
      </div>
    </button>
</Link>
    </div>
  )
}

export default LiquidGlassButton;
