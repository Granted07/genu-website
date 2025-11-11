"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { AudioLines, Headphones, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Manrope, Playfair_Display } from "next/font/google"

import { cn } from "@/lib/utils"

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

const tracks = [
  {
    id: "echoes-of-assembly",
    title: "Echoes of Assembly",
    subtitle: "A field recording from last week's midnight vigil, layered with live commentary.",
    tags: ["dispatch", "ambient", "voices"],
    mood: "resonant",
    duration: "03:18",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "pulse-report",
    title: "Pulse Report 07",
    subtitle: "High-tempo briefing on campus organizing and street-level logistics.",
    tags: ["briefing", "percussion"],
    mood: "urgent",
    duration: "03:04",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "frequency-dossier",
    title: "Frequency Dossier",
    subtitle: "Interview snippets with changemakers scored with modular synth beds.",
    tags: ["interview", "synth", "future"],
    mood: "luminous",
    duration: "03:27",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: "riot-lullaby",
    title: "Riot Lullaby",
    subtitle: "Spoken word over downtempo rhythms collected from community archives.",
    tags: ["spoken", "downtempo"],
    mood: "nocturnal",
    duration: "03:09",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  }
]

const waveformSeeds = tracks.map((_, trackIndex) =>
  Array.from({ length: 16 }, (_, barIndex) => 0.35 + (((barIndex + trackIndex) % 5) * 0.13))
)

const floatingShapes = [
  "-top-24 left-[8%] h-40 w-40 rotate-[22deg] bg-white/8",
  "top-[28%] right-[10%] h-28 w-28 rotate-[-18deg] bg-amber-300/15",
  "bottom-[18%] left-[12%] h-20 w-20 rotate-[12deg] bg-white/10",
  "bottom-[-8%] right-[16%] h-32 w-32 rotate-[24deg] bg-white/12"
]

const defaultEasing = [0.19, 1, 0.22, 1] as [number, number, number, number]

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00"
  const clamped = Math.max(seconds, 0)
  const minutes = Math.floor(clamped / 60)
  const remaining = Math.floor(clamped % 60)
  return `${minutes}:${remaining.toString().padStart(2, "0")}`
}

export default function HallOfNoisePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const prevVolumeRef = useRef(0.8)

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeLabel, setTimeLabel] = useState("0:00")
  const [durationLabel, setDurationLabel] = useState(tracks[0]?.duration ?? "—")
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null)
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null)

  const prefersReducedMotion = useReducedMotion()

  const currentTrack = tracks[currentTrackIndex]
  const isCurrentMuted = isMuted || volume === 0

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.src = currentTrack.src
    audio.load()
    setProgress(0)
    setTimeLabel("0:00")
    setDurationLabel(currentTrack.duration)
    setDurationSeconds(null)

    if (isPlaying) {
      const playPromise = audio.play()
      if (playPromise) {
        playPromise.catch(() => setIsPlaying(false))
      }
    }
  }, [currentTrackIndex, currentTrack.duration, currentTrack.src, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      const playPromise = audio.play()
      if (playPromise) {
        playPromise.catch(() => setIsPlaying(false))
      }
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoaded = () => {
      if (audio.duration) {
        setDurationLabel(formatTime(audio.duration))
        setDurationSeconds(audio.duration)
      }
    }

    const handleTimeUpdate = () => {
      if (isScrubbing || !audio.duration) return
      const nextProgress = audio.currentTime / audio.duration
      setProgress(nextProgress)
      setTimeLabel(formatTime(audio.currentTime))
    }

    const handleEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
      setIsPlaying(true)
    }

    audio.addEventListener("loadedmetadata", handleLoaded)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [isScrubbing])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const update = () => {
      if (!isScrubbing && audio.duration) {
        const nextProgress = audio.currentTime / audio.duration
        setProgress(nextProgress)
        setTimeLabel(formatTime(audio.currentTime))
      }
      if (isPlaying) {
        rafRef.current = requestAnimationFrame(update)
      }
    }

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(update)
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isPlaying, isScrubbing])

  useEffect(() => {
    const handleGlobalPlaybackToggle = (event: KeyboardEvent) => {
      const isMediaKey = event.code === "MediaPlayPause"
      const isSpaceKey = event.code === "Space" || event.key === " " || event.key === "Spacebar"

      if (!isMediaKey && !isSpaceKey) {
        return
      }

      if (event.defaultPrevented) {
        return
      }

      const target = event.target as HTMLElement | null
      if (event.repeat) {
        return
      }

      if (target) {
        const tagName = target.tagName.toLowerCase()
        if (["input", "textarea", "select", "button"].includes(tagName) || target.isContentEditable) {
          return
        }
      }

      event.preventDefault()
      setIsPlaying((prev) => !prev)
    }

    window.addEventListener("keydown", handleGlobalPlaybackToggle)
    return () => window.removeEventListener("keydown", handleGlobalPlaybackToggle)
  }, [setIsPlaying])

  const handleSelectTrack = (index: number) => {
    if (index === currentTrackIndex) {
      setIsPlaying((prev) => !prev)
      return
    }
    setCurrentTrackIndex(index)
    setIsPlaying(true)
  }

  const handleScrub = (value: number) => {
    setProgress(value)
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const newTime = value * audio.duration
    setTimeLabel(formatTime(newTime))
  }

  const commitScrub = (value: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) {
      setIsScrubbing(false)
      return
    }
    audio.currentTime = value * audio.duration
    setTimeLabel(formatTime(audio.currentTime))
    setIsScrubbing(false)
    if (!isPlaying) {
      setProgress(value)
    }
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    if (value > 0) {
      prevVolumeRef.current = value
      setIsMuted(false)
    } else {
      setIsMuted(true)
    }
  }

  const toggleMute = () => {
    if (isMuted || volume === 0) {
      const restored = prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.5
      setVolume(restored)
      setIsMuted(false)
    } else {
      prevVolumeRef.current = volume
      setIsMuted(true)
    }
  }

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
    setIsPlaying(true)
  }

  const playPrevious = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
    setIsPlaying(true)
  }

  return (
    <div
      className={cn(
        manrope.className,
        "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(5,5,5,0.94)_55%)] text-white"
      )}
    >
      <audio ref={audioRef} preload="metadata" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,12,0.72),rgba(8,8,8,0.96))]" />

      {floatingShapes.map((classes, index) => (
        <motion.div
          key={classes}
          className={cn("pointer-events-none absolute z-0 rounded-[22%] blur-[1px]", classes)}
          initial={{ opacity: 0.25, scale: 0.8 }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.35, scale: 1 }
              : {
                  opacity: [0.25, 0.6, 0.3],
                  scale: [0.9, 1.05, 0.95]
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 12 + index * 2, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}

  <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 pb-24 pt-20 sm:gap-14 sm:px-6 sm:pb-28 sm:pt-24 md:gap-16 md:px-10 md:pb-32 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: defaultEasing }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.62rem] uppercase tracking-[0.45em] text-white/70 backdrop-blur">
            <Headphones size={14} />
            Hall of Noise
          </span>
          <h1
            className={cn(
              playfair.className,
              "text-balance text-[clamp(2.9rem,7.5vw,4.8rem)] font-semibold uppercase leading-[0.88]"
            )}
          >
            Hall of Noise
          </h1>
          <p className="max-w-2xl text-sm uppercase tracking-[0.4em] text-white/65">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit et reprehenderit nam ex culpa praesentium dicta mollitia architecto sed beatae recusandae consequuntur debitis reiciendis, quidem illum possimus, veritatis in distinctio?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-[0.68rem] uppercase tracking-[0.35em] text-white/70">
            <span className="rounded-full border border-white/20 px-4 py-2">Field recordings</span>
            <span className="rounded-full border border-white/20 px-4 py-2">Dispatch briefs</span>
            <span className="rounded-full border border-white/20 px-4 py-2">Spoken word</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.15, duration: 0.7, ease: defaultEasing }}
          className="grid gap-6 sm:gap-8 md:grid-cols-2"
        >
          {tracks.map((track, index) => {
            const isActive = index === currentTrackIndex
            const isHovered = hoveredTrack === track.id

            return (
              <motion.button
                key={track.id}
                type="button"
                className={cn(
                  "group relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-white/10 p-5 text-left transition-colors backdrop-blur focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:rounded-[1.8rem] sm:p-7",
                  isActive ? "border-white/35 bg-white/15" : "hover:border-white/25 hover:bg-white/12"
                )}
                onClick={() => handleSelectTrack(index)}
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
                aria-pressed={isActive}
                aria-label={`Cue ${track.title}`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(120deg,transparent_0,transparent_18px,rgba(255,255,255,0.08)_18px,rgba(255,255,255,0.08)_20px)] opacity-20 transition-opacity group-hover:opacity-40" />
                <div className="pointer-events-none absolute inset-[12px] rounded-[1.3rem] border border-white/10 sm:inset-[14px] sm:rounded-[1.4rem]" />

                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[0.6rem] uppercase tracking-[0.35em] text-white/60 sm:text-[0.62rem]">
                    <span>{track.duration}</span>
                    <span className="flex items-center gap-2">
                      <AudioLines size={14} />
                      {track.mood}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className={cn(playfair.className, "text-[1.65rem] font-semibold uppercase leading-tight")}>{track.title}</h3>
                    <p className="text-sm uppercase tracking-[0.35em] text-white/55">Track {index + 1}</p>
                    <p className="text-sm leading-relaxed text-white/70">{track.subtitle}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-white/65">
                    {track.tags.map((tag) => (
                      <span key={`${track.id}-${tag}`} className="rounded-full bg-white/12 px-3 py-1">{tag}</span>
                    ))}
                  </div>

                  <div className="mt-4 flex h-9 items-end gap-1 sm:mt-5 sm:h-10" aria-hidden="true">
                    {waveformSeeds[index].map((seed, barIndex) => (
                      <motion.span
                        key={`${track.id}-bar-${barIndex}`}
                        className="block h-full w-1 origin-bottom rounded-full bg-white/60"
                        animate={
                          prefersReducedMotion
                            ? { scaleY: 0.4 + seed * (isActive ? 0.55 : 0.3) }
                            : {
                                scaleY:
                                  isActive && isPlaying
                                    ? [0.45 + seed * 0.55, 0.75 + seed * 0.7, 0.4 + seed * 0.5]
                                    : 0.45 + seed * (isActive ? 0.6 : isHovered ? 0.4 : 0.28)
                              }
                        }
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 0.5 + barIndex * 0.015, repeat: isActive && isPlaying ? Infinity : 0, repeatType: "mirror" }
                        }
                      />
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.35em] text-white/60">
                    <span>{isActive ? (isPlaying ? "Playing" : "Paused") : "Tap to cue"}</span>
                    {isActive && (
                      <span className="rounded-full border border-white/30 px-3 py-1">
                        Live feed
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </main>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2, duration: 0.6, ease: defaultEasing }}
        className="fixed bottom-3 left-1/2 z-30 w-full max-w-[min(90vw,46rem)] -translate-x-1/2 rounded-[1.8rem] border border-white/15 bg-[rgba(12,12,12,0.85)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur sm:bottom-6 sm:rounded-[2.2rem] sm:p-6"
        aria-live="polite"
      >
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.58rem] uppercase tracking-[0.35em] text-white/55 sm:text-[0.65rem]">
            <span>{currentTrack.title}</span>
            <span>{durationLabel}</span>
          </div>

          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-[0.58rem] uppercase tracking-[0.35em] text-white/55 sm:text-[0.65rem]">{timeLabel}</span>
            <div className="relative w-full flex-1 min-w-0">
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(progress * 1000)}
                onChange={(event) => {
                  setIsScrubbing(true)
                  const fraction = Number(event.target.value) / 1000
                  handleScrub(fraction)
                }}
                onMouseUp={(event) => {
                  const fraction = Number((event.target as HTMLInputElement).value) / 1000
                  commitScrub(fraction)
                }}
                onTouchEnd={(event) => {
                  const target = event.target as HTMLInputElement
                  const fraction = Number(target.value) / 1000
                  commitScrub(fraction)
                }}
                aria-label="Playback position"
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-neutral-900/40 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:-mt-[6px] [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-neutral-900/40"
              />
              <motion.span
                className="pointer-events-none absolute left-0 top-1/2 h-1.5 rounded-full bg-white"
                animate={{ width: `${progress * 100}%` }}
                transition={prefersReducedMotion ? { duration: 0 } : { type: "tween", duration: isScrubbing ? 0 : 0.2 }}
              />
            </div>
            <span className="text-[0.58rem] uppercase tracking-[0.35em] text-white/55 sm:text-[0.65rem]">
              {durationSeconds != null ? formatTime(Math.max(durationSeconds - progress * durationSeconds, 0)) : "0:00"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="max-sm:hidden flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left sm:gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 sm:h-12 sm:w-12">
                <Headphones size={20} />
              </div>
              <div className="flex flex-col text-[0.62rem] uppercase tracking-[0.35em] text-white/60 sm:text-[0.7rem]">
                <span>Hall of Noise</span>
                <span className="text-white/40">Track {currentTrackIndex + 1} of {tracks.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white sm:gap-4">
              <button
                type="button"
                onClick={playPrevious}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:border-white/35 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:h-11 sm:w-11"
                aria-label="Play previous track"
              >
                <SkipBack size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-white text-neutral-900 transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:h-16 sm:w-16"
                aria-label={isPlaying ? "Pause" : "Play"}
                aria-keyshortcuts="Space"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                type="button"
                onClick={playNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:border-white/35 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:h-11 sm:w-11"
                aria-label="Play next track"
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="hidden items-center gap-2.5 text-white sm:flex sm:gap-3">
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:border-white/35 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:h-11 sm:w-11"
                aria-label={isCurrentMuted ? "Unmute" : "Mute"}
              >
                {isCurrentMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((isCurrentMuted ? 0 : volume) * 100)}
                onChange={(event) => handleVolumeChange(Number(event.target.value) / 100)}
                aria-label="Volume"
                className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/20 accent-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[0.65rem] [&::-webkit-slider-thumb]:w-[0.65rem] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-neutral-900/40 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:-mt-[5px] [&::-moz-range-thumb]:h-[0.65rem] [&::-moz-range-thumb]:w-[0.65rem] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-neutral-900/40 sm:w-28"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
